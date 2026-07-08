/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/components/speak2me-voice-select.js
 #
 # claude - improve SpeakToMe code using lit #1
 # Reactive voice picker built on Lit.  Replaces the jQuery-built <select>
 # that was previously injected into #voiceSelector via getVoices() in
 # speak2me.js (lines ~2302–2349).
 #
 # The original implementation:
 #   * Mutated the DOM imperatively with $().append(...) inside a forEach,
 #     re-creating <option> elements every time it was called
 #   * Mixed browser-detection (isChrome / isEdge) into the rendering loop
 #   * Used setAttribute('selected', 'selected') instead of the DOM property,
 #     so subsequent reassignments of voiceUserDefault didn't update the UI
 #   * Returned `voices.length - skippedVoices` from a function whose name
 #     suggests it returns voices — confusing dual-purpose API
 #
 # This component renders the dropdown declaratively from a `voices` array
 # property and emits a typed `voice-change` event when the user picks one.
 # -----------------------------------------------------------------------------
*/

// claude - improve SpeakToMe code using lit #1
import { LitElement, html, css } from 'lit';

export class Speak2MeVoiceSelect extends LitElement {

  // claude - improve SpeakToMe code using lit #1
  static properties = {
    voices:         { type: Array  },
    selected:       { type: String },
    placeholder:    { type: String },
    ignoreProvider: { type: String, attribute: 'ignore-provider' },
  };

  // claude - improve SpeakToMe code using lit #1
  static styles = css`
    :host {
      display: block;
      margin-top: 0.75rem;
    }
    select {
      width: 100%;
      padding: 0.4rem 0.6rem;
      font-size: 0.95rem;
    }
  `;

  constructor() {
    super();
    this.voices         = [];
    this.selected       = '';
    this.placeholder    = 'Choose a voice';
    this.ignoreProvider = '';
  }

  // claude - improve SpeakToMe code using lit #1
  // Browser-specific filter logic lifted from getVoices() in speak2me.js.
  // Kept here because it's purely a *display* concern (which voices to show
  // in the picker), not a speech-engine concern.  Memoised by caching on the
  // property update cycle — Lit only calls render() when properties change.
  _filteredVoices() {
    const ua       = navigator.userAgent;
    const vendor   = navigator.vendor || '';
    const isChrome = /Chrome/.test(ua) && /Google Inc/.test(vendor) && !/Edg/.test(ua);
    const isEdge   = /Edg/.test(ua);

    return (this.voices || []).filter((v) => {
      if (isChrome && this.ignoreProvider && v.name.includes(this.ignoreProvider)) {
        return false;
      }
      // Edge: only the "Natural" (online neural) voices are worth offering —
      // matches the original speak2me.js behaviour.
      if (isEdge && !v.name.includes('Natural')) {
        return false;
      }
      return true;
    });
  }

  // claude - improve SpeakToMe code using lit #1
  _onChange(e) {
    const name = e.target.value;
    this.selected = name;
    this.dispatchEvent(new CustomEvent('voice-change', {
      detail:   { name },
      bubbles:  true,
      composed: true,
    }));
  }

  // claude - improve SpeakToMe code using lit #1
  // Declarative render — ?selected=${...} uses Lit's boolean attribute
  // binding which correctly toggles the attribute presence instead of always
  // setting it to the string "selected" (the bug in the original code where
  // re-renders left stale selected attributes).
  render() {
    const list = this._filteredVoices();
    return html`
      <select @change=${this._onChange} aria-label="Voice selection">
        <option value="" ?selected=${!this.selected}>${this.placeholder}</option>
        ${list.map((v) => html`
          <option value=${v.name} ?selected=${v.name === this.selected}>
            ${v.name}${v.lang ? ` — ${v.lang}` : ''}
          </option>
        `)}
      </select>
    `;
  }
}

// claude - improve SpeakToMe code using lit #1
if (!customElements.get('speak2me-voice-select')) {
  customElements.define('speak2me-voice-select', Speak2MeVoiceSelect);
}
