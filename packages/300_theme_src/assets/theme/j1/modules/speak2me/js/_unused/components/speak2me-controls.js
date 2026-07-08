/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/components/speak2me-controls.js
 #
 # claude - improve SpeakToMe code using lit #1
 # Transport-control buttons built on Lit.  Replaces the five inline-onclick
 # buttons (#speak_button, #stop_button, #pause_button, #resume_button,
 # #exit_button) in speak2me.html.
 #
 # The original markup showed/hid these buttons by writing
 # `style="...; display: none;"` directly in the Liquid template and then
 # toggling visibility imperatively from speak2me.js.  Three problems with
 # that approach:
 #
 #   1. The initial state was hard-coded in HTML (speak shown, others hidden),
 #      which only works on first load — re-opening the modal after a stop
 #      could leave the wrong button visible.
 #   2. Hide/show happened by direct style mutation, scattered across the
 #      jQuery plugin.  No single source of truth for "what state is the
 #      player in".
 #   3. data-bs-dismiss="modal" was on EVERY button including Stop and Pause,
 #      so pressing them also closed the modal — making it impossible to
 #      pause then resume from the same dialog.
 #
 # This component derives visibility from two boolean properties (`speaking`
 # and `paused`) and emits semantic events.  The parent <speak2me-modal>
 # decides when (or whether) to close.
 # -----------------------------------------------------------------------------
*/

// claude - improve SpeakToMe code using lit #1
import { LitElement, html, css } from 'lit';

export class Speak2MeControls extends LitElement {

  // claude - improve SpeakToMe code using lit #1
  static properties = {
    speaking:    { type: Boolean },
    paused:      { type: Boolean },
    labels:      { type: Object  },
    btnStyles:   { type: Object  },
  };

  // claude - improve SpeakToMe code using lit #1
  // Light-DOM is NOT used here; Shadow DOM is fine because we render plain
  // <button> elements and the Bootstrap classes are forwarded as strings.
  // The host page Bootstrap CSS does not penetrate the shadow root, so we
  // restate the minimum needed (sizing + gap) and let downstream consumers
  // style further via ::part if needed.
  static styles = css`
    :host {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    button {
      min-width: 180px;
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      border-radius: 0.25rem;
      border: 1px solid transparent;
      cursor: pointer;
    }
    /* Map a small Bootstrap-style palette so the component looks right even
       without an external stylesheet. */
    .success { background: #198754; color: white; }
    .danger  { background: #dc3545; color: white; }
    .warning { background: #ffc107; color: #212529; }
    .info    { background: #0dcaf0; color: #212529; }
    .primary { background: #0d6efd; color: white; }
    .secondary { background: #6c757d; color: white; }
    button:disabled { opacity: 0.55; cursor: not-allowed; }
  `;

  constructor() {
    super();
    this.speaking  = false;
    this.paused    = false;
    this.labels    = {
      speak:  'Speak',
      stop:   'Stop',
      pause:  'Pause',
      resume: 'Resume',
      exit:   'Close',
    };
    this.btnStyles = {
      speak:  'success',
      stop:   'danger',
      pause:  'warning',
      resume: 'info',
      exit:   'warning',
    };
  }

  // claude - improve SpeakToMe code using lit #1
  // Single helper, dispatches a typed event up to the parent modal.  The
  // parent decides whether (and when) to dismiss the dialog — this component
  // never touches data-bs-dismiss.
  _emit(name) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  // claude - improve SpeakToMe code using lit #1
  // Visibility is derived from state instead of being hard-coded in markup.
  //   not speaking            → show [Speak]
  //   speaking && not paused  → show [Stop, Pause]
  //   speaking && paused      → show [Stop, Resume]
  // [Close] is always available.
  render() {
    const { labels, btnStyles } = this;
    return html`
      ${!this.speaking ? html`
        <button type="button" class=${btnStyles.speak}
                @click=${() => this._emit('speak-click')}>
          ${labels.speak}
        </button>
      ` : html`
        <button type="button" class=${btnStyles.stop}
                @click=${() => this._emit('stop-click')}>
          ${labels.stop}
        </button>
        ${!this.paused ? html`
          <button type="button" class=${btnStyles.pause}
                  @click=${() => this._emit('pause-click')}>
            ${labels.pause}
          </button>
        ` : html`
          <button type="button" class=${btnStyles.resume}
                  @click=${() => this._emit('resume-click')}>
            ${labels.resume}
          </button>
        `}
      `}
      <button type="button" class=${btnStyles.exit}
              @click=${() => this._emit('exit-click')}>
        ${labels.exit}
      </button>
    `;
  }
}

// claude - improve SpeakToMe code using lit #1
if (!customElements.get('speak2me-controls')) {
  customElements.define('speak2me-controls', Speak2MeControls);
}
