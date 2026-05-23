/*
 # -----------------------------------------------------------------------------
 # ~/src/js/modules/lit/speak2me-highlight-controller.lit.js
 # OPTIONAL — Lit ReactiveController sketch for the speak2me highlighter.
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # claude - improve SpeakToMe code using lit #1
 #
 # This file is NOT required for the modal-UI refactor in
 # speak2me-modal.lit.js and is NOT wired into template.js by default.
 # It is a sketch showing how the highlighting state inside speak2me.js
 # (currentHighlightedElement, currentParagraphSentences, currentSentenceOffset,
 # chunkCounter, etc.) could be lifted out of module-level `var`s into a
 # single ReactiveController owned by the modal component.
 #
 # Benefits if adopted later:
 #   - the modal can render a live "speaking paragraph N of M" indicator
 #     simply by binding to controller.chunkCounter / controller.chunkTotal
 #   - HMR works cleanly because state lives on an object, not in closures
 #   - tests can drive the controller without a SpeechSynthesis polyfill
 #
 # Caveat: the legacy speak2me.js still owns the SpeechSynthesisUtterance and
 # all browser-event plumbing.  The controller below is an *observer*, not a
 # replacement.  Wire it up by calling `controller.update(...)` from the
 # existing onstart / onend / onboundary listeners in speak2me.js.
 # -----------------------------------------------------------------------------
*/

// claude - improve SpeakToMe code using lit #1
export class Speak2MeHighlightController {

  constructor(host) {
    // ReactiveController contract — Lit will call hostConnected / hostDisconnected.
    this.host = host;
    if (host && typeof host.addController === 'function') {
      host.addController(this);
    }

    this.currentHighlightId       = null;
    this.previousHighlightId      = null;
    this.currentParagraphSentences = [];
    this.currentSentenceOffset    = 0;
    this.chunkCounter             = 0;
    this.chunkTotal               = 0;
    this.isSpeaking               = false;
    this.isPaused                 = false;
  }

  // Lifecycle hooks — invoked by Lit when the host element (dis)connects.
  hostConnected()    { /* no-op for now */ }
  hostDisconnected() { this.reset(); }

  // claude - improve SpeakToMe code using lit #1
  // Called from speak2me.js's onstart handler.  Replaces the module-level
  // `currentHighlightedElement = elementid` mutation.
  setHighlight(speak2meId) {
    if (speak2meId === this.currentHighlightId) return;
    this.previousHighlightId = this.currentHighlightId;
    this.currentHighlightId  = speak2meId;
    this._requestUpdate();
  }

  // Called when a new paragraph starts being spoken.
  setSentences(sentences) {
    this.currentParagraphSentences = Array.isArray(sentences) ? sentences : [];
    this.currentSentenceOffset     = 0;
    this._requestUpdate();
  }

  // Called from findSentenceIndexForChunk -> calculateSentenceOffset.
  setSentenceOffset(offset) {
    this.currentSentenceOffset = Number.isFinite(offset) ? offset : 0;
    this._requestUpdate();
  }

  // Called from the speechMonitor loop on every chunk advance.
  setProgress({ chunk = 0, total = 0 } = {}) {
    this.chunkCounter = chunk;
    this.chunkTotal   = total;
    this._requestUpdate();
  }

  setPlaybackState({ speaking = false, paused = false } = {}) {
    this.isSpeaking = !!speaking;
    this.isPaused   = !!paused;
    this._requestUpdate();
  }

  reset() {
    this.currentHighlightId        = null;
    this.previousHighlightId       = null;
    this.currentParagraphSentences = [];
    this.currentSentenceOffset     = 0;
    this.chunkCounter              = 0;
    this.chunkTotal                = 0;
    this.isSpeaking                = false;
    this.isPaused                  = false;
    this._requestUpdate();
  }

  // claude - improve SpeakToMe code using lit #1
  // Asks the Lit host to schedule a re-render.  Guarded for the case where
  // the controller is used without a host (e.g. in unit tests).
  _requestUpdate() {
    if (this.host && typeof this.host.requestUpdate === 'function') {
      this.host.requestUpdate();
    }
  }
}
