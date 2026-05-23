/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/components/speak2me-range.js
 #
 # claude - improve SpeakToMe code using lit #1
 # Reusable labelled range slider built on Lit.  Replaces the three repeated
 # <label>+<input type="range">+<span class="val"> blocks in speak2me.html.
 #
 # The original markup wired user interaction with inline event attributes:
 #   oninput="j1.adapter.speak2me.update(this, value)"
 #   onchange="j1.adapter.speak2me.update(this, value)"
 # (note the typo "nchange" on the volume slider — silently dropped the
 # onchange handler).  That pattern couples the modal markup to a global
 # adapter and makes the value display ("<span class='val'>...") out-of-sync
 # with the slider until JS reaches in by id.
 #
 # This component instead:
 #   * Exposes typed reactive properties (min/max/step/value)
 #   * Renders its own value badge that updates declaratively
 #   * Emits a single semantic CustomEvent('range-change') that bubbles and
 #     composes through Shadow DOM, so the parent <speak2me-modal> can route
 #     it to the engine without the child knowing about j1.adapter.*
 # -----------------------------------------------------------------------------
*/

// claude - improve SpeakToMe code using lit #1
import { LitElement, html, css } from 'lit';

export class Speak2MeRange extends LitElement {

  // claude - improve SpeakToMe code using lit #1
  // Declared reactive properties — Lit re-renders on assignment and parses
  // attribute values according to `type` (Number values come through as
  // numbers, not strings as with raw DOM attributes).
  static properties = {
    name:  { type: String },
    label: { type: String },
    min:   { type: Number },
    max:   { type: Number },
    step:  { type: Number },
    value: { type: Number },
  };

  // claude - improve SpeakToMe code using lit #1
  // Encapsulated styles via Shadow DOM — no leakage into or out of the host
  // page.  The original modal relied on inline `style="margin-left: 30px"`
  // attributes per slider (with three different magic numbers to compensate
  // for label widths) which is exactly the kind of thing component scoping
  // eliminates.
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 5rem 1fr 2.5rem;
      align-items: center;
      column-gap: 0.75rem;
      margin-block: 0.4rem;
    }
    label {
      font-size: 0.95rem;
    }
    input[type="range"] {
      width: 100%;
    }
    .value {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-size: 0.9rem;
      opacity: 0.85;
    }
  `;

  constructor() {
    super();
    this.name  = '';
    this.label = '';
    this.min   = 0;
    this.max   = 1;
    this.step  = 0.1;
    this.value = 0.5;
  }

  // claude - improve SpeakToMe code using lit #1
  // Single typed event replaces the dual inline `oninput`/`onchange` glue.
  // bubbles + composed lets the parent listen at the modal level without
  // poking into the Shadow DOM.
  _onInput(e) {
    const next = parseFloat(e.target.value);
    if (Number.isNaN(next)) return;
    this.value = next;
    this.dispatchEvent(new CustomEvent('range-change', {
      detail:   { name: this.name, value: next },
      bubbles:  true,
      composed: true,
    }));
  }

  // claude - improve SpeakToMe code using lit #1
  // .value=${...} (with the dot) binds to the DOM property — necessary so the
  // slider tracks programmatic updates after the initial render.  Using the
  // attribute form `value=${...}` would set the *default* value only.
  render() {
    return html`
      <label for="range-${this.name}">${this.label}</label>
      <input
        id="range-${this.name}"
        type="range"
        name=${this.name}
        min=${this.min}
        max=${this.max}
        step=${this.step}
        .value=${String(this.value)}
        @input=${this._onInput}
      />
      <span class="value">${this.value.toFixed(1)}</span>
    `;
  }
}

// claude - improve SpeakToMe code using lit #1
if (!customElements.get('speak2me-range')) {
  customElements.define('speak2me-range', Speak2MeRange);
}
