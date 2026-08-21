/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/plugins/controls/zoom/zoom.js
 # Provides the zoom plugin for Video.js V8 and newer.
 # Version 1.2.6 for Video.js V8
 #
 # See: https://github.com/theonlyducks/videojs-zoom
 #
 # Product/Info:
 # https://github.com/theonlyducks/videojs-zoom/blob/main/README.md
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 The Only Ducks
 # Copyright (C) 2023-2026 Juergen Adams
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

    const version   = '1.2.6';
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

    // Fix multiPlayer piZoomButtons
    // Strip undefined/null members from an option object BEFORE it is merged
    // over DEFAULT_OPTIONS.
    //
    // Reason: videojs.obj.merge() (V8) copies every OWN key of a source,
    // including the ones whose value is `undefined`. A caller that hands over
    // a fully spelled out option object built from YAML — e.g.
    //
    //     { zoom: 1, showZoom: undefined, showMove: undefined }
    //
    // (the show* keys are simply not present in videojs.yml) — would therefore
    // OVERWRITE the `true` defaults with `undefined` and every button row of
    // the zoom panel would silently disappear. Dropping the empty members
    // keeps the defaults in charge and makes the merge behave the way the
    // plugin documentation describes: "only what you set is changed".
    //
    // Non-plain input (undefined, null, a class instance) yields an empty
    // object, so the merge falls back to DEFAULT_OPTIONS unchanged.
    //
    function _definedOnly(options) {
        if (!options || typeof options !== 'object') {
            return {};
        }
        const cleaned = {};
        Object.keys(options).forEach(key => {
            const value = options[key];
            if (value !== undefined && value !== null) {
                cleaned[key] = value;
            }
        });
        return cleaned;
    }

    // Fix multiPlayer piZoomButtons
    // Turn the ID of a player into the fragment that makes the IDs of the
    // zoom panel unique on a page carrying more than one player.
    //
    // The click wiring in ZoomModal.listeners() derives the name of the
    // action from the button ID by splitting it at the DOUBLE underscore:
    //
    //     vjs-zoom-buttons__zoomIn   ->  ['vjs-zoom-buttons', 'zoomIn']
    //
    // The fragment is therefore inserted BEFORE that separator, never after
    // it, and it must not contain a double underscore of its own or the
    // split would return the wrong piece. Everything that is not a letter,
    // a digit or a dash becomes a dash — underscores included — so a double
    // underscore can never be produced, and the result is a valid ID part.
    //
    //     player_1  ->  '_player-1'  ->  vjs-zoom-buttons_player-1__zoomIn
    //
    // An empty, missing or unusable scope yields an empty string, and the
    // IDs stay exactly as they were before this fix.
    //
    function _idScope(scope) {
        if (!scope || typeof scope !== 'string') {
            return '';
        }
        const cleaned = scope.replace(/[^A-Za-z0-9-]/g, '-');
        return cleaned ? '_' + cleaned : '';
    }

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
            // Fix multiPlayer piZoomButtons
            // The gesture handler was permanently dead. `_enabled` started as
            // `false` here and was only ever written from the observer message
            // the plugin sends in its constructor — and that message carried
            // the plugin's own `_enabled`, a member that is never assigned
            // anywhere in this file, i.e. `undefined`. Pointer and wheel
            // gestures therefore returned early for the lifetime of the page,
            // no matter what the configuration said.
            //
            // The component now reads the state it was created with, so the
            // documented `gestureHandler` switch really decides whether the
            // gestures work. Together with the guarded addChild() in the
            // plugin constructor (same fix tag) the component is only created
            // at all when the switch is on, so this initial value is `true`
            // in practice; it is read defensively all the same, because a
            // player may add the component directly.
            //
            this._enabled       = !!(options && options.state && options.state.gestureHandler);
            this._observer      = Observer.getInstance();
            this.pointers       = {};
            this.player         = player.el();
            this.state          = options.state;
            this.function       = new ZoomFunction(player, options);

            player.on("loadstart", () => {
                this.gesture();
            });

            // Fix multiPlayer piZoomButtons
            // The Observer is a process-wide singleton (Observer.getInstance()),
            // so every zoom plugin on the page talks to the same listener list.
            // The callback below accepted ANY 'plugin' message, which means the
            // second player of a multiPlayer page overwrote the gesture state
            // of the first one. Harmless while the value was always `undefined`
            // (see above), but a real cross-talk now that the value carries the
            // configured `gestureHandler`.
            //
            // The message now names its sender (see the notify() call in the
            // plugin constructor, same fix tag) and messages from a foreign
            // plugin instance are ignored. A message without a sender is still
            // accepted, so an external caller using the old payload shape keeps
            // working.
            //
            this._observer.subscribe('plugin', state => {
                if (!state) { return; }
                if (state.plugin && options && state.plugin !== options.plugin) { return; }
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

            // Fix multiPlayer piZoomButtons
            // The Observer is a process-wide singleton, and this callback
            // accepted the state of EVERY zoom plugin on the page. On a
            // multiPlayer page the second player therefore overwrote the zoom
            // state of the first one at creation time and again on every zoom,
            // move, rotate or flip. Reproduction: zoom player 2 three steps up,
            // then press zoom-in ONCE on player 1 — player 1 jumped straight to
            // 1.8x instead of stepping to 1.2x, because it continued counting
            // from the state of player 2. Reset behaved the same way.
            //
            // The message is sent by _notify() as the plugin's own state
            // OBJECT, so the sender can be recognised by identity: a state that
            // is not the state of this instance's plugin belongs to another
            // player and is ignored. A message that cannot be attributed is
            // still accepted, so nothing that worked before stops working.
            //
            this.observer.subscribe('change', state => {
                if (state && this.plugin && this.plugin.state && state !== this.plugin.state) {
                    return;
                }
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

        // Fix multiPlayer piZoomButtons
        // The gesture handler calls zoomHandler() on every wheel step, and
        // moveX()/moveY() — the two methods the drag path uses — call
        // _getMoveYAvailable()/_getMoveXAvailable() to find out how far the
        // picture may still be pushed. None of the three was ever defined in
        // this file. Nobody noticed, because the gesture handler was dead
        // (see the ZoomGesture constructor): every call returned before it
        // reached them.
        //
        // Now that `gestureHandler` really switches the gestures on, the
        // missing methods would throw a TypeError on the first wheel step and
        // on the first drag, so they are supplied here. They follow the rules
        // the button handlers already use:
        //
        //   available distance  = moveCount * salt of that axis
        //                         (identical to moveUp/moveDown/moveLeft/
        //                          moveRight)
        //   wheel zoom          = current zoom + delta, limited to the same
        //                         range as the zoom buttons (1 .. 9.8), with
        //                         moveCount kept in step so the picture cannot
        //                         be dragged further than it was zoomed
        //
        // The `|| 0` fallbacks keep a gesture that arrives before the first
        // 'playing' event (salt still unset) from producing NaN.
        //
        _getMoveXAvailable() {
            return (this.state.moveCount || 0) * (this.state.saltMoveX || 0);
        }

        _getMoveYAvailable() {
            return (this.state.moveCount || 0) * (this.state.saltMoveY || 0);
        }

        zoomHandler(salt) {
            const next = Math.min(9.8, Math.max(1, this.state.zoom + salt));
            if (next === this.state.zoom) { return; }
            this.state.zoom      = next;
            this.state.moveCount = Math.round((this.state.zoom - 1) / ZOOM_SALT);
            this.plugin.zoom(this.state.zoom);
            this.plugin.listeners.change(this.state);
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
        // Fix multiPlayer piZoomButtons
        // The content builder was created without any argument, so it had no
        // way of learning which button rows the player asked for. The panel
        // markup was therefore always complete. The constructor now takes the
        // resolved plugin state and hands it to _createContent().
        //
        // The panel markup used fixed element IDs (vjs-zoom-buttons__zoomIn,
        // __moveUp, __reset, ...). One player per page is fine; a multiPlayer
        // page builds the same IDs once per player and the document ends up
        // with duplicates, which HTML does not allow. Nothing broke so far
        // because the click wiring looks the buttons up per player element
        // (getElementsByClassName on the player), but the markup was invalid
        // and any getElementById() — in a page script, a test, an assistive
        // technology — would reach the first player only.
        //
        // The builder now takes the ID of the owning player as a second
        // argument and inserts it into every button ID (see _createContent).
        // The argument is optional: without it the IDs are byte-identical to
        // the ones built before this fix.
        //
        constructor(options, scope) {
            this.content = null;
            this.options = _definedOnly(options);
            this.scope   = _idScope(scope);
            this._createContent(this.options);
        } // END constructor

        // =====================================================================
        // methods
        // =====================================================================

        getContent() {
            return this.content;
        }

        _createContent(contentOptions) {
            const idScope = this.scope || '';

            const zoom = `
                <div class="vjs-zoom-buttons__container--row">
                    <button id="vjs-zoom-buttons${idScope}__zoomIn" class="vjs-zoom-buttons__button" data-zoom-action="zoomIn">
                        <span class="vjs-zoom-icons">add</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons${idScope}__zoomOut" class="vjs-zoom-buttons__button" data-zoom-action="zoomOut">
                        <span class="vjs-zoom-icons">remove</span>
                    </button>
                </div>
            `;

            const move = `
                <div class="vjs-zoom-buttons__container--row cross--top">
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons${idScope}__moveUp" class="vjs-zoom-buttons__button" data-zoom-action="moveUp">
                        <span class="vjs-zoom-icons">arrow_drop_up</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                </div>
                <div class="vjs-zoom-buttons__container--row cross--middle">
                    <button id="vjs-zoom-buttons${idScope}__moveLeft" class="vjs-zoom-buttons__button" data-zoom-action="moveLeft">
                        <span class="vjs-zoom-icons">arrow_left</span>
                    </button>
                    <button id="vjs-zoom-buttons${idScope}__reset" class="vjs-zoom-buttons__button" data-zoom-action="reset">
                        <span class="vjs-zoom-icons">fiber_manual_record</span>
                    </button>
                    <button id="vjs-zoom-buttons${idScope}__moveRight" class="vjs-zoom-buttons__button" data-zoom-action="moveRight">
                        <span class="vjs-zoom-icons">arrow_right</span>
                    </button>
                </div>
                <div class="vjs-zoom-buttons__container--row cross--bottom">
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons${idScope}__moveDown" class="vjs-zoom-buttons__button" data-zoom-action="moveDown">
                        <span class="vjs-zoom-icons">arrow_drop_down</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                </div>
            `;

            const rotate = `
                <div class="vjs-zoom-buttons__container--row">
                    <button id="vjs-zoom-buttons${idScope}__rotate" class="vjs-zoom-buttons__button" data-zoom-action="rotate">
                        <span class="vjs-zoom-icons">rotate_left</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons${idScope}__flip" class="vjs-zoom-buttons__button" data-zoom-action="flip">
                        <span class="vjs-zoom-icons">swap_horiz</span>
                    </button>
                </div>
            `;

            // Fix multiPlayer piZoomButtons
            // The second line below declared `var options` and, in the very
            // same statement, read `options` as the merge source. Because
            // `var` is hoisted to the top of the function, the name `options`
            // was already bound — to `undefined` — when the right hand side
            // was evaluated. videojs.obj.merge() skips falsy sources, so the
            // merge collapsed to a plain copy of DEFAULT_OPTIONS and every
            // switch handed in by the caller was thrown away. The panel was
            // therefore always built with ALL rows: zoom, move cross, rotate.
            //
            // The parameter `contentOptions` now carries the resolved plugin
            // state (see ZoomModal.createEl()), and _definedOnly() protects
            // the defaults against members that are merely absent from the
            // YAML configuration. A caller that passes nothing still gets the
            // complete panel, i.e. the visible behaviour of every existing
            // configuration is unchanged.
            //
            var mergeOptions = (videojs.VERSION <= "7.10.0") ? videojs.mergeOptions : videojs.obj.merge;
            var options  = mergeOptions(DEFAULT_OPTIONS, _definedOnly(contentOptions));
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

            // Fix multiPlayer piZoomButtons
            // The zoom panel (.vjs-zoom-buttons__container) is added as a direct
            // child of the PLAYER (see player.addChild('ZoomModal', ...) in the
            // zoomButtons constructor), not as a child of the control bar. It
            // therefore does NOT inherit the control bar's fade-out: when the
            // pointer goes idle during playback Video.js hides ".vjs-control-bar"
            // — the magnifier button rides along inside it — but the floating
            // panel kept hovering over the picture.
            //
            // The panel is now kept in lockstep with the bar. Video.js hides the
            // bar through the CSS selector
            //
            //     .vjs-has-started.vjs-user-inactive.vjs-playing .vjs-control-bar
            //
            // i.e. the bar is hidden exactly when the player HAS started, is
            // PLAYING (not paused) and the user is INACTIVE. _syncBarVisibility()
            // reads those same three states straight from the player API and
            // mirrors them onto the container, and it is invoked from the very
            // events that flip those states — so the panel hides and reappears
            // in the same tick as the bar, never a frame apart (synchronously).
            //
            // Every handler is bound with player.on(...) on THIS player, so on a
            // multiPlayer page a second player drives only its own panel.
            //
            const _syncBar = () => { this._syncBarVisibility(); };
            player.on('useractive',   _syncBar);
            player.on('userinactive', _syncBar);
            player.on('playing',      _syncBar);
            player.on('pause',        _syncBar);
            player.on('ended',        _syncBar);
            player.on('loadstart',    _syncBar);

            // Fix multiPlayer piZoomButtons
            // Bookkeeping for the reveal hand-off, see _revealWithBarCurve().
            // The three members are declared here so they exist for the whole
            // lifetime of the component and belong to THIS ZoomModal only — on
            // a multiPlayer page every player carries its own pending timer and
            // its own listener, and nothing is ever shared between them.
            //
            this._barRevealTimer     = null;
            this._barRevealContainer = null;
            this._barRevealHandler   = null;
        } // END constructor

        // =====================================================================
        // methods
        // =====================================================================

        createEl() {
            const modal = videojs.dom.createEl('div', {
            className: 'vjs-zoom-buttons__container'
            });

            // Fix multiPlayer piZoomButtons
            // Second half of the option plumbing. Even with a repaired merge
            // inside _createContent(), the switches could not arrive as long
            // as the content builder was called without an argument here.
            //
            // `this.options_` is the option object of this component, filled
            // in by the Video.js Component base class BEFORE createEl() is
            // called, so `state` — the plugin state merged in the zoomButtons
            // constructor — is readable at this point. `this.plugin` and
            // `this.function` are NOT: they are assigned further down in the
            // ZoomModal constructor, after super() (and therefore createEl())
            // has already returned. Reading the state instead of the plugin
            // keeps this safe.
            //
            // The optional chain falls back to `undefined`, which
            // _definedOnly() turns into an empty object, so a modal built
            // without state still yields the complete panel.
            // 
            // The ID of the owning player is handed over as well, so the
            // panel of every player on the page gets its own element IDs.
            //
            // `this.player_` is set by the Video.js Component base class
            // before createEl() runs — the same guarantee the #2 fix above
            // relies on for `this.options_`. `this.player` (without the
            // underscore) is NOT usable here: the ZoomModal constructor
            // assigns it only after super() has returned.
            //
            // Falls back to an empty scope when the player cannot be asked
            // for its ID, which reproduces the IDs used before this fix.
            //
            const modalOptions = (this.options_ && this.options_.state) ? this.options_.state : this.options_;
            const modalScope   = (this.player_ && typeof this.player_.id === 'function') ? this.player_.id() : '';
            const content   = new ZoomModalContent(modalOptions, modalScope);
            modal.innerHTML = content.getContent();

            return modal;
        }

        listeners() {
            var buttons = this.player.getElementsByClassName('vjs-zoom-buttons__button');
            buttons     = Array.from(buttons);

            // Fix multiPlayer piZoomButtons
            // The action was derived from the element ID alone, so the ID had
            // to keep its exact shape forever — the very shape that produced
            // duplicate IDs on a multiPlayer page. The button now names its
            // action itself (data-zoom-action, see _createContent), and the
            // ID split remains as a fallback for markup that predates this
            // fix or is supplied from outside.
            //
            // The added existence check keeps an unknown action from throwing
            // "this.function[action] is not a function" on click; a button
            // that cannot be resolved is simply left without a handler.
            //
            buttons.map(button => {
            const dataAction = button.getAttribute('data-zoom-action');
            const [, idAction] = button.id.split('__');
            const action = dataAction || idAction;
            if (!action || typeof this.function[action] !== 'function') { return; }
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

        // Fix multiPlayer piZoomButtons
        // "barHidden" is computed from the same three conditions the Video.js
        // CSS uses for ".vjs-control-bar" (has-started + playing + user-inactive),
        // read from the player API so the result never depends on the order in
        // which Video.js and this handler happen to react to a shared event.
        //
        // While hidden the container fades on the SAME 1s curve as the bar and
        // is made click-through; while visible every inline property is cleared
        // again, so the panel falls back to its normal, ".open"-driven styling.
        // Only inline styles are touched, which keeps the change additive: no
        // stylesheet is required and the open/closed behaviour of the panel — and
        // the byte-identical single-player markup — stay exactly as before.
        //
        _syncBarVisibility() {
            const player = this.player_;
            if (!player) { return; }
            const [container] = this.player.getElementsByClassName('vjs-zoom-buttons__container');

            if (!container) { return; }

            const started  = (typeof player.hasStarted === 'function') ? player.hasStarted() : true;
            const playing  = (typeof player.paused === 'function')     ? !player.paused()    : true;
            const inactive = (typeof player.userActive === 'function') ? !player.userActive() : false;

            // Fix multiPlayer piZoomButtons
            // One state combination was missing from the mirror. Video.js keeps
            // the control bar on screen for audio sources even while the user is
            // idle — the core stylesheet re-shows it through
            //
            //     .vjs-audio.vjs-has-started.vjs-user-inactive.vjs-playing .vjs-control-bar
            //     .vjs-audio-only-mode.vjs-has-started.vjs-user-inactive.vjs-playing .vjs-control-bar
            //
            // (opacity: 1, visibility: visible, pointer-events: auto). The three
            // states read above are all true in that situation, so the panel was
            // faded out while the bar it belongs to stayed put. Since J1
            // MultiPlayer serves native mp3 next to mp4 and YouTube, an audio
            // item can put a player into exactly that mode.
            //
            // The two marker classes sit on the PLAYER element, the same element
            // the core selectors above are anchored on, so testing them here
            // reproduces the core rule instead of guessing at it. Guarded with a
            // typeof check because Element.matches() is absent in very old
            // engines; the guard then evaluates to false and the behaviour is
            // byte-identical to the previous version.
            //
            const playerEl  = (typeof player.el === 'function') ? player.el() : null;
            const audioBar  = !!(playerEl && typeof playerEl.matches === 'function' &&
                                 playerEl.matches('.vjs-audio, .vjs-audio-only-mode'));
            const barHidden = started && playing && inactive && !audioBar;

            if (barHidden) {
                // Fix multiPlayer piZoomButtons
                // A reveal that is still running has a hand-off pending which
                // would wipe the inline transition set two lines below (see
                // _revealWithBarCurve). That happens whenever the user goes idle
                // again within the fade-in window — a quick pointer wiggle is
                // enough. The pending hand-off is therefore dropped BEFORE the
                // hide curve is installed, so the hide is never stripped of its
                // transition halfway through.
                //
                this._cancelBarReveal();

                // Fix multiPlayer piZoomButtons
                // The fade curve is no longer written into the plugin. The literal
                // 1s below was copied from the core stylesheet, which is correct
                // for stock Video.js but wrong the moment a theme re-times the
                // control bar: the bar would then fade on the theme's curve and
                // the panel on Video.js's, and the two would drift apart on
                // screen. _barFadeTransition() reads the transition the browser
                // has actually resolved for THIS player's control bar and copies
                // it verbatim, so both elements are driven by one and the same
                // declaration. The old literal stays as the fallback for the case
                // that the bar cannot be read (no element, no computed style, or
                // no timed transition declared at all).
                //
                container.style.transition    = this._barFadeTransition() || 'visibility 1s, opacity 1s';
                container.style.opacity       = '0';
                container.style.visibility    = 'hidden';
                container.style.pointerEvents = 'none';
            } else {
                // Fix multiPlayer piZoomButtons
                // Hiding was already driven by the bar's own curve (fix #5), but
                // showing was not: clearing the inline styles handed the panel
                // back to its stylesheet, where zoom.css declares
                //
                //     transition: visibility .2s, opacity .2s;
                //
                // while the control bar fades back in on the core curve
                //
                //     .video-js.vjs-has-started .vjs-control-bar
                //     { transition: visibility .1s, opacity .1s; }
                //
                // So the bar was fully back while the panel was still only half
                // there — the same drift fix #5 removed for the hide direction,
                // just the other way round.
                //
                // Simply writing the bar's curve into the inline style would fix
                // the drift and break something else: that inline declaration
                // outlives the fade and would then also re-time the panel's OWN
                // open/close animation, which is what those .2s in zoom.css are
                // there for. That is the reason this was not done silently in #4.
                //
                // _revealWithBarCurve() keeps both: it borrows the bar's curve
                // for the duration of the fade-in and gives the panel back to
                // zoom.css the moment the fade is over. The .2s open/close
                // animation is therefore untouched, and no stylesheet change is
                // needed — the change stays inline and additive, exactly like #4.
                //
                this._revealWithBarCurve(container);
            }
        }

        // Fix multiPlayer piZoomButtons
        // Returns the computed CSS "transition" shorthand of the control bar
        // element, e.g. "visibility 1s ease 0s, opacity 1s ease 0s" for stock
        // Video.js, or whatever the theme has put in its place. Returns an empty
        // string when the value cannot be trusted, which lets the caller fall
        // back to the literal it used before this fix.
        //
        // Why this is read at call time and not cached once: the transition of
        // the bar is not a constant. The core stylesheet declares a fast curve
        // for the visible bar (visibility .1s, opacity .1s) and a slow one for
        // the faded bar (1s), and the theme may add further rules on top. The
        // value therefore has to be taken in the very moment the panel is faded
        // out, so that the curve of the HIDE direction is picked up.
        //
        // The timing is safe. Video.js flips the state classes on the player
        // element BEFORE it triggers "useractive"/"userinactive" (see
        // Player.prototype.userActive), so by the time this method runs the bar
        // already matches its new rule. And unlike opacity, "transition" is not
        // itself animatable — the browser reports the newly declared value at
        // once instead of an interpolated in-between value, which is what makes
        // reading it in the same tick reliable.
        //
        // The bar element is fetched through the component tree first
        // (getChild('ControlBar')), which is unambiguous per player instance.
        // The class lookup below it is a fallback for players built with a
        // custom children list, and it is scoped to this.player — the element of
        // THIS player — so a second player on the page is never consulted.
        //
        _barFadeTransition() {
            const player = this.player_;
            let   barEl  = null;

            if (player && typeof player.getChild === 'function') {
                const bar = player.getChild('ControlBar');
                if (bar && typeof bar.el === 'function') { barEl = bar.el(); }
            }
            if (!barEl && this.player) {
                const [found] = this.player.getElementsByClassName('vjs-control-bar');
                barEl = found || null;
            } 
            if (!barEl || typeof window === 'undefined') { return ''; }
            if (typeof window.getComputedStyle !== 'function') { return ''; }

            let style = null;
            try { style = window.getComputedStyle(barEl); } catch (error) { return ''; }
            if (!style) { return ''; }

            // Fix multiPlayer piZoomButtons
            // A bar without a timed transition reports the initial shorthand
            // ("all 0s ease 0s"). Copying that would make the panel disappear
            // instantly, so such a value is rejected and the caller keeps its
            // own fallback. Durations are always reported in seconds.
            //
            const shorthand = (style.transition || '').trim();
            const durations = (style.transitionDuration || '').split(',');
            const timed     = durations.some(value => parseFloat(value) > 0);

            return (shorthand && timed) ? shorthand : '';
        }

        // Fix multiPlayer piZoomButtons
        // Bring the panel back on the control bar's own fade-in curve, then give
        // it back to zoom.css.
        //
        // The method runs in three steps:
        //
        //   1. Read the curve the bar is fading in with, right now. The very
        //      same _barFadeTransition() the hide direction uses serves both
        //      directions unchanged: it reports the transition the browser has
        //      resolved for the bar at the moment of the call, and Video.js has
        //      already removed ".vjs-user-inactive" from the player element
        //      before it triggers "useractive" — so the value read here is the
        //      SHOWN curve (core: .1s), not the faded one (core: 1s).
        //
        //   2. Install that curve inline and clear the three properties fix #4
        //      had set, so the panel fades in on the bar's timing. Transition
        //      and the animated properties are written in the same tick on
        //      purpose: the browser starts a transition from the value the
        //      "transition" property has AFTER the change, so one style pass is
        //      enough and no forced reflow is needed.
        //
        //   3. Hand the panel back. When the fade has finished, the inline
        //      transition is removed again and the panel is driven by zoom.css
        //      once more — the .2s of the panel's own open/close animation
        //      survive this fix untouched.
        //
        // Two ways lead to that hand-off, and either is enough: the "transitionend"
        // event of the container (the exact moment, used whenever the fade really
        // runs) and a timer derived from the curve itself (the safety net for the
        // cases in which no transition is started at all — see below). Whichever
        // arrives first tears the other one down.
        //
        // A closed panel is left alone completely. Without the ".open" class the
        // panel is invisible in both states, so there is nothing to keep in sync;
        // it gets the plain style reset of fix #4 and keeps its own curve from
        // the first frame. The same plain reset is used when the bar cannot be
        // read (fix #5 returns an empty string then) or when the environment has
        // no timer/listener to defer with — in all those cases the behaviour is
        // byte-identical to the version before this fix.
        //
        // Note on the order of events: ZoomButton is created BEFORE ZoomModal
        // (see the zoomButtons constructor), so its "useractive" handler has
        // already re-added ".open" by the time this method runs. The test below
        // therefore sees the state the panel is going to be in, not the one it
        // is leaving.
        //
        _revealWithBarCurve(container) {
            if (!container) { return; }

            this._cancelBarReveal();

            const isOpen  = !!(container.classList &&
                               typeof container.classList.contains === 'function' &&
                               container.classList.contains('open'));

            // Fix multiPlayer piZoomButtons
            // Is the panel really coming back from the hidden state? The inline
            // "visibility"/"opacity" of the container are written by the hide
            // branch of _syncBarVisibility() and by nothing else — open() and
            // close() work through the ".open" class — so their presence is
            // direct evidence of a fade that is being undone.
            //
            // Without this test the borrowed curve would also be installed when
            // nothing is fading at all. That is not a rare corner: this branch
            // runs on every "playing", "pause", "ended" and "loadstart", and for
            // an audio source it runs on "userinactive" too, because Video.js
            // keeps the bar on screen there (see fix #5 above). The panel would
            // then carry a foreign transition for up to the length of that curve
            // and a close click landing inside that window would animate on the
            // bar's timing instead of the .2s from zoom.css.
            //
            const wasHidden = (container.style.visibility === 'hidden') ||
                              (container.style.opacity    === '0');
            const curve   = (isOpen && wasHidden) ? this._barFadeTransition() : '';
            const canWait = (typeof window !== 'undefined') &&
                            (typeof window.setTimeout === 'function') &&
                            (typeof container.addEventListener === 'function');

            if (!curve || !canWait) {
                container.style.transition    = '';
                container.style.opacity       = '';
                container.style.visibility    = '';
                container.style.pointerEvents = '';
                return;
            }

            container.style.transition    = curve;
            container.style.opacity       = '';
            container.style.visibility    = '';
            container.style.pointerEvents = '';

            const handOff = () => {
                this._cancelBarReveal();
                container.style.transition = '';
            };

            // Fix multiPlayer piZoomButtons
            // "transitionend" bubbles, and it is fired once per animated
            // property, so events of a child element and the second property of
            // the panel itself are filtered out here. The first event of the
            // container is the one that matters: opacity and visibility share
            // one curve, so at that point the fade-in is complete.
            //
            const onEnd = (event) => {
                if (event && event.target && event.target !== container) { return; }
                handOff();
            };

            this._barRevealContainer = container;
            this._barRevealHandler   = onEnd;
            container.addEventListener('transitionend', onEnd);

            // Fix multiPlayer piZoomButtons
            // The safety net. No "transitionend" is fired when no property
            // actually changes — a panel that is already fully shown, a browser
            // running with "prefers-reduced-motion", a tab that is put into the
            // background mid-fade. Without the timer the borrowed curve would
            // stay inline in those cases and would silently re-time the next
            // open/close of the panel, which is precisely what this fix is meant
            // to avoid.
            //
            this._barRevealTimer = window.setTimeout(handOff, this._barCurveDurationMs(curve));
        }

        // Fix multiPlayer piZoomButtons
        // How long the borrowed curve runs, in milliseconds.
        //
        // The value is taken from the curve string that was just installed
        // rather than by asking the DOM a second time, so the timer can never
        // describe a different declaration than the one on the element.
        //
        // Parenthesised groups are removed first, because cubic-bezier(...) and
        // steps(...) carry commas of their own and would otherwise cut a
        // segment in two. Per segment the first time value is the duration and
        // the second one the delay ("opacity 0.1s ease 0s"); the longest
        // segment wins. A small margin is added so the timer cannot fire just
        // before the browser reports the end of the fade, and a ceiling keeps a
        // pathological declaration from parking the borrowed curve on the panel
        // for minutes. An unreadable value falls back to a fifth of a second,
        // comfortably longer than the .1s of the Video.js core curve.
        //
        _barCurveDurationMs(curve) {
            const FALLBACK = 300;
            const MARGIN   = 60;
            const CEILING  = 5000;

            if (!curve || typeof curve !== 'string') { return FALLBACK; }

            const toMs = (value) => {
                const number = parseFloat(value);
                if (isNaN(number)) { return 0; }
                return /ms$/.test(value) ? number : number * 1000;
            };

            let longest = 0;
            curve.replace(/\([^)]*\)/g, ' ').split(',').forEach(segment => {
                const times    = segment.match(/-?[0-9.]+m?s/g) || [];
                const duration = (times.length > 0) ? toMs(times[0]) : 0;

                // Fix _barCurveDurationMs - ReferenceError: delay is not defined
                // The delay of the segment was used one line below but never
                // read. Class bodies are strict mode, so the free identifier
                // did not silently resolve to `undefined` — it threw a
                // ReferenceError, which Video.js caught in its event
                // dispatcher and printed as "VIDEOJS: ERROR: ReferenceError:
                // delay is not defined". The comment above the method already
                // describes this second time value ("the second one the delay")
                // so only the declaration itself was missing.
                //
                // Per CSS transition segment the FIRST time value is the
                // duration and the SECOND one the delay ("opacity 0.1s ease 0s"
                // -> 0.1s / 0s). A segment without a second value has no delay,
                // hence the 0. A negative delay is legal in CSS (it starts the
                // transition mid-way) and must not shorten the timer below the
                // duration, which is what the Math.max() below takes care of.
                //
                const delay    = (times.length > 1) ? toMs(times[1]) : 0;
                const total    = duration + Math.max(delay, 0);
                if (total > longest) { longest = total; }
            });

            if (!(longest > 0)) { return FALLBACK; }
            return Math.min(longest + MARGIN, CEILING);
        }

        // Fix multiPlayer piZoomButtons
        // Drop a pending hand-off: stop the timer and unsubscribe the listener.
        //
        // Only the bookkeeping is touched, never a style. The two callers need
        // opposite things right afterwards — the hide branch installs its own
        // curve, the hand-off removes the inline one — and keeping the style out
        // of here lets both do that without fighting each other. Calling the
        // method when nothing is pending is a no-op, so it is safe to call it on
        // every state change and on dispose.
        //
        _cancelBarReveal() {
            if (this._barRevealTimer &&
                typeof window !== 'undefined' &&
                typeof window.clearTimeout === 'function') {
                window.clearTimeout(this._barRevealTimer);
            }
            this._barRevealTimer = null;

            if (this._barRevealContainer && this._barRevealHandler &&
                typeof this._barRevealContainer.removeEventListener === 'function') {
                this._barRevealContainer.removeEventListener('transitionend', this._barRevealHandler);
            }
            this._barRevealContainer = null;
            this._barRevealHandler   = null;
        }

        // Fix multiPlayer piZoomButtons
        // A player that is torn down mid-fade must not leave a timer and a DOM
        // listener behind — on a multiPlayer page players are disposed while
        // others keep running, and a playlist item change can dispose a player
        // in exactly the moment the bar is fading back in. The base class work
        // is left to Video.js.
        //
        dispose() {
            this._cancelBarReveal();
            super.dispose();
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
            this.isOpen = !this.isOpen;
            modal.toggle();
        }

    } // END class ZoomButton

    class zoomButtons extends Plugin {
        constructor(player) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            super(player, options);
            this.player = player.el();

            this.listeners = {
                click:  () => {},
                change:     () => {}
            };

            // Use built-in merge function from Video.js v5.0+ or v4.4.0+
            // videojs.mergeOptions is deprecated in V8 and will be removed in V9
            var mergeOptions = (videojs.VERSION <= "7.10.0") ? videojs.mergeOptions : videojs.obj.merge;

            // Fix multiPlayer piZoomButtons
            // Same protection as in _createContent(). The caller (player.js)
            // builds the option object from the YAML configuration, and a key
            // that is not spelled out there arrives as `undefined`. Merged
            // without filtering, such a member would replace a working default
            // with `undefined` — `zoom: undefined` alone makes moveCount NaN
            // and writes "scale(+undefined, undefined)" into the transform of
            // the video element, i.e. the picture disappears. Filtering the
            // empty members keeps every unset key on its default.
            //
            this.state = mergeOptions(DEFAULT_OPTIONS, _definedOnly(options));
                this.player.style.overflow  = 'hidden';
                this.state.flip             = "+";
                this.state.moveCount        = Math.round((this.state.zoom - 1) / ZOOM_SALT);

                player.getChild('ControlBar').addChild('ZoomButton');

                player.addChild('ZoomModal', {
                    plugin: this,
                    state: this.state
                });

                // Fix multiPlayer piZoomButtons
                // `gestureHandler` sits in DEFAULT_OPTIONS (default: false) but
                // was never read: the gesture component was added to EVERY
                // player unconditionally. That was not merely a dead option,
                // it was a defect. ZoomGesture binds a "wheel" listener to the
                // player element that calls preventDefault() BEFORE it checks
                // whether gestures are enabled, so scrolling the page with the
                // pointer over a video was swallowed — while the gestures
                // themselves never worked (see the ZoomGesture constructor).
                //
                // The component is now created only when the switch asks for
                // it. With the shipped default (false) a player no longer
                // blocks page scrolling; with `gestureHandler: true` the
                // gestures are created AND enabled, i.e. the option finally
                // does what its name promises.
                //
                // `_enabled` is set before the component is created so the
                // notify() below reports a real value instead of `undefined`,
                // and the message names its sender so a second player on the
                // page cannot overwrite this player's gesture state.
                //
                this._enabled = !!this.state.gestureHandler;
                if (this._enabled) {
                    player.addChild('ZoomGesture', {
                        plugin: this,
                        state: this.state
                    });
                }

                this._observer = Observer.getInstance();
                this._observer.notify("plugin", { enabled: this._enabled, plugin: this });
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