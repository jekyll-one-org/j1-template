/*
 # -----------------------------------------------------------------------------
 # ~/modules/videojs/js/plugins/controls/nextprevbuttons/js/nextprevbuttons.js
 # Provides the nextPrevButtons plugin for Video.js V8 and newer.
 # Adds previous-/next-item buttons to the control bar that drive a playlist
 # managed by the videojs-playlist plugin.
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.videojsnextPrevButtons = factory(global.videojs));
})(this, (function (videojs) {

  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var videojs__default = /*#__PURE__*/_interopDefaultLegacy(videojs);
  var version = "1.0.0";

  const Button = videojs__default["default"].getComponent('Button'); // Default options for the plugin.

  // claude - New J1 nextPrevButtons #1
  // Enable both buttons by default. The control-bar positions
  // (previousIndex/nextIndex) are intentionally left unset so they are
  // auto-computed relative to the skipButtons plugin (see onPlayerReady).
  //
  const defaults = {
    previous: true,
    next:     true
  };

  // Set up buttons when the player is ready
  //
  const onPlayerReady = (player, options) => {
    player.addClass('vjs-next-prev-buttons');

    const controlBar = player.controlBar;

    // claude - New J1 nextPrevButtons #2
    // previous button: placed immediately BEFORE the "skip backward" button
    // when the skipButtons plugin is present, otherwise right after the play
    // toggle. An explicit numeric options.previousIndex always wins.
    //
    if (options.previous) {
      let index = options.previousIndex;

      if (typeof index !== 'number') {
        index = controlBar.seekBack
          ? controlBar.children().indexOf(controlBar.seekBack)
          : 1;
      }

      controlBar.previousItem = controlBar.addChild('playlistButton', {
        direction: 'previous'
      }, index);
    }

    // claude - New J1 nextPrevButtons #3
    // next button: placed immediately AFTER the "skip forward" button when the
    // skipButtons plugin is present, otherwise appended to the control bar.
    // The seekForward index is read AFTER the previous button was inserted, so
    // the position already accounts for the shift it caused.
    //
    if (options.next) {
      let index = options.nextIndex;

      if (typeof index !== 'number') {
        index = controlBar.seekForward
          ? controlBar.children().indexOf(controlBar.seekForward) + 1
          : undefined;
      }

      controlBar.nextItem = controlBar.addChild('playlistButton', {
        direction: 'next'
      }, index);
    }
  };

  // Plugin init if ready or on ready
  // An object of options left to the plugin author to define.
  //
  const nextPrevButtons = function (options) {
    this.ready(() => {
      onPlayerReady(this, videojs__default["default"].obj.merge(defaults, options));
    });
  };

  // Set version number
  //
  nextPrevButtons.VERSION = version;

  // claude - New J1 nextPrevButtons #4
  // Single button component handling both directions, mirroring the SeekButton
  // pattern of the skipButtons plugin.
  //
  class PlaylistButton extends Button {

    // Constructor for class
    //
    // @param {Player|Object} player The player
    // @param {Object=} options Button options
    // @param {string} options.direction previous or next
    //
    constructor(player, options) {
      super(player, options);

      if (this.options_.direction === 'previous') {
        this.$('.vjs-icon-placeholder').classList.add('vjs-icon-previous-item');
        this.controlText(this.localize('Previous'));
      } else if (this.options_.direction === 'next') {
        this.$('.vjs-icon-placeholder').classList.add('vjs-icon-next-item');
        this.controlText(this.localize('Next'));
      }

      // claude - New J1 nextPrevButtons #5
      // Keep the enabled/disabled state in sync with the playlist position.
      // The playlist plugin emits 'playlistitem' (item selected), 'playlistchange'
      // (list replaced) and 'playlistsorted'; 'loadstart' covers the initial load.
      //
      this._updateState = this._updateState.bind(this);
      this._stateEvents = ['loadstart', 'playlistitem', 'playlistchange', 'playlistsorted'];
      player.on(this._stateEvents, this._updateState);
      this._updateState();
    }

    // Return button class names for the direction
    //
    buildCSSClass() {
      /* Each button will have the classes:
         `vjs-playlist-button`
         `skip-previous` or `skip-next`
      */
      return `vjs-playlist-button skip-${this.options_.direction} ${super.buildCSSClass()}`;
    }

    // claude - New J1 nextPrevButtons #6
    // Disable the button when there is no playlist, no current item, or no item
    // to move to. previousIndex()/nextIndex() clamp at the ends (and wrap when
    // repeat is on), so a target equal to the current index means "nowhere to go".
    //
    _updateState() {
      const playlist = this.player_.playlist;

      // playlist plugin not initialised yet / not present
      if (!playlist || typeof playlist.currentIndex !== 'function') {
        this.disable();
        return;
      }

      const current = playlist.currentIndex();
      const last    = playlist.lastIndex();

      // nothing loaded / empty list
      if (current < 0 || last < 0) {
        this.disable();
        return;
      }

      const target = (this.options_.direction === 'previous')
        ? playlist.previousIndex()
        : playlist.nextIndex();

      if (target === current) {
        this.disable();
      } else {
        this.enable();
      }
    }

    // Load the previous/next playlist item
    //
    handleClick() {
      const playlist = this.player_.playlist;

      if (!playlist || typeof playlist.next !== 'function') {
        return;
      }

      if (this.options_.direction === 'previous') {
        playlist.previous();
      } else if (this.options_.direction === 'next') {
        playlist.next();
      }
    }

    // claude - New J1 nextPrevButtons #7
    // Detach the state listeners on dispose to avoid leaks across re-renders.
    //
    dispose() {
      if (this._stateEvents) {
        this.player_.off(this._stateEvents, this._updateState);
      }
      super.dispose();
    }

  }

  // register components|plugin
  //
  videojs__default["default"].registerComponent('PlaylistButton', PlaylistButton);
  videojs__default["default"].registerPlugin('nextPrevButtons', nextPrevButtons);

  return nextPrevButtons;

}));
