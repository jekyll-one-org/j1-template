/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/components/speak2me-modal.js
 #
 # claude - improve SpeakToMe code using lit #1
 # Top-level <speak2me-modal> Lit element.  Replaces the entire
 # <div id="speak2me-modal">...</div> Bootstrap modal block in speak2me.html.
 #
 # Composition (declarative):
 #   <speak2me-modal>
 #     <speak2me-range  name="rate"   .value=${this.rate}   />
 #     <speak2me-range  name="pitch"  .value=${this.pitch}  />
 #     <speak2me-range  name="volume" .value=${this.volume} />
 #     <speak2me-voice-select .voices=${this.voices} />
 #     <speak2me-controls .speaking=${this.speaking} .paused=${this.paused} />
 #   </speak2me-modal>
 #
 # This element does NOT re-implement the speech engine.  It defers to the
 # existing `j1.adapter.speak2me` bridge so the 2,400-line core in
 # speak2me.js can be reused unchanged.  The bridge call surface assumed:
 #
 #   j1.adapter.speak2me.speak(selector)
 #   j1.adapter.speak2me.stop()
 #   j1.adapter.speak2me.pause()
 #   j1.adapter.speak2me.resume()
 #   j1.adapter.speak2me.update({ id, name, value }, value)  // legacy slider
 #
 # If the J1 project later exposes typed setters (setRate / setPitch /
 # setVolume / setVoice) those will be preferred automatically.
 #
 # Render root:
 #   This element uses LIGHT DOM (`createRenderRoot() { return this; }`)
 #   because:
 #     * Bootstrap classes on .modal-dialog / .modal-content / .modal-header
 #       / .modal-body need to resolve against the host page's Bootstrap CSS
 #     * The existing J1 modal-opening JS (data-bs-target="#speak2me-modal")
 #       expects to find the dialog in the regular DOM tree
 #   The child components (range / voice-select / controls) DO use Shadow DOM
 #   so their internal styling stays encapsulated.
 # -----------------------------------------------------------------------------
*/

// claude - improve SpeakToMe code using lit #1
import { LitElement, html } from 'lit';
import './speak2me-range.js';
import './speak2me-voice-select.js';
import './speak2me-controls.js';

export class Speak2MeModal extends LitElement {

  // claude - improve SpeakToMe code using lit #1
  static properties = {
    config:        { type: Object  },                          // merged from YAML via Liquid
    open:          { type: Boolean, reflect: true },
    speaking:      { type: Boolean },
    paused:        { type: Boolean },
    rate:          { type: Number  },
    pitch:         { type: Number  },
    volume:        { type: Number  },
    voices:        { type: Array   },
    selectedVoice: { type: String  },
  };

  // claude - improve SpeakToMe code using lit #1
  // Render into the light DOM so Bootstrap can find .modal-dialog etc.
  // Shadow DOM would isolate the children from the host page's Bootstrap
  // theme — the wrong trade-off here.
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.config        = null;
    this.open          = false;
    this.speaking      = false;
    this.paused        = false;
    this.rate          = 1.0;
    this.pitch         = 1.0;
    this.volume        = 1.0;
    this.voices        = [];
    this.selectedVoice = '';
    this._onVoicesChanged = this._onVoicesChanged.bind(this);
  }

  // claude - improve SpeakToMe code using lit #1
  // Lifecycle hook — wire up speechSynthesis voice loading once and tear it
  // down on disconnect.  The original code attached
  // `speechSynthesis.onvoiceschanged = populateVoiceList` globally, which
  // overwrites any other listener the page might have.  addEventListener +
  // removeEventListener composes cleanly.
  connectedCallback() {
    super.connectedCallback();
    this._loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', this._onVoicesChanged);
    }
    this._applyConfigDefaults();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (window.speechSynthesis) {
      window.speechSynthesis.removeEventListener('voiceschanged', this._onVoicesChanged);
    }
  }

  // claude - improve SpeakToMe code using lit #1
  // Triggered both by `connectedCallback` and the browser voiceschanged
  // event (some browsers populate getVoices() asynchronously).
  _onVoicesChanged() {
    this._loadVoices();
  }

  _loadVoices() {
    if (!window.speechSynthesis) return;
    const list = window.speechSynthesis.getVoices() || [];
    // Sort: German + English first (matches the original getVoices() split),
    // others after, alphabetical within each group.
    const byLang = (prefix) => list.filter((v) => (v.lang || '').startsWith(prefix));
    const other  = list.filter((v) =>
      !(v.lang || '').startsWith('de') && !(v.lang || '').startsWith('en')
    );
    const cmp = (a, b) => a.name.localeCompare(b.name);
    this.voices = [
      ...byLang('de').sort(cmp),
      ...byLang('en').sort(cmp),
      ...other.sort(cmp),
    ];
  }

  // claude - improve SpeakToMe code using lit #1
  // Pull slider defaults out of the YAML-derived config.  This replaces the
  // Liquid expressions {{ speak2me_options.modal.settings.voice_*_value }}
  // that were previously interpolated into the HTML at build time.
  _applyConfigDefaults() {
    const s = this.config && this.config.modal && this.config.modal.settings;
    if (!s) return;
    if (s.voice_speed_value  != null) this.rate   = parseFloat(s.voice_speed_value);
    if (s.voice_pitch_value  != null) this.pitch  = parseFloat(s.voice_pitch_value);
    if (s.voice_volume_value != null) this.volume = parseFloat(s.voice_volume_value);
  }

  // claude - improve SpeakToMe code using lit #1
  // Resolve the speech-engine bridge lazily on each interaction.  This
  // tolerates the bridge being defined AFTER the component (J1 plugin
  // load order varies between dev / prod).
  _bridge() {
    return (window.j1 && window.j1.adapter && window.j1.adapter.speak2me) || null;
  }

  // claude - improve SpeakToMe code using lit #1
  // One handler for all three sliders — distinguished by detail.name.  Tries
  // a typed setter first (forward-compatible) and falls back to the existing
  // legacy `update(elementLike, value)` contract.
  _onRangeChange(e) {
    const { name, value } = e.detail;
    this[name] = value;

    const bridge = this._bridge();
    if (!bridge) return;

    const typedSetter = {
      rate:   'setRate',
      pitch:  'setPitch',
      volume: 'setVolume',
    }[name];

    if (typedSetter && typeof bridge[typedSetter] === 'function') {
      bridge[typedSetter](value);
    } else if (typeof bridge.update === 'function') {
      // Legacy fallback — mimic the shape of an <input> element so the
      // existing adapter, which reads element.id/.name/.value, keeps working.
      bridge.update({ id: name, name, value: String(value) }, value);
    }
  }

  // claude - improve SpeakToMe code using lit #1
  _onVoiceChange(e) {
    this.selectedVoice = e.detail.name;
    const bridge = this._bridge();
    if (!bridge) return;
    if (typeof bridge.setVoice === 'function') {
      bridge.setVoice(this.selectedVoice);
    } else if (typeof bridge.update === 'function') {
      bridge.update({ id: 'voice', name: 'voice', value: this.selectedVoice }, this.selectedVoice);
    }
  }

  // claude - improve SpeakToMe code using lit #1
  // Transport actions.  Each updates local reactive state AND calls the
  // bridge — Lit then re-renders <speak2me-controls> with the right buttons
  // visible.  No more imperative show/hide.
  _onSpeak() {
    const bridge = this._bridge();
    const selector = (this.config && this.config.speechSelector) || 'main';
    if (bridge && typeof bridge.speak === 'function') bridge.speak(selector);
    this.speaking = true;
    this.paused   = false;
  }

  _onStop() {
    const bridge = this._bridge();
    if (bridge && typeof bridge.stop === 'function') bridge.stop();
    this.speaking = false;
    this.paused   = false;
  }

  _onPause() {
    const bridge = this._bridge();
    if (bridge && typeof bridge.pause === 'function') bridge.pause();
    this.paused = true;
  }

  _onResume() {
    const bridge = this._bridge();
    if (bridge && typeof bridge.resume === 'function') bridge.resume();
    this.paused = false;
  }

  _onExit() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('speak2me-close', {
      bubbles: true, composed: true,
    }));
  }

  render() {
    const s     = (this.config && this.config.modal && this.config.modal.settings) || {};
    const title = (this.config && this.config.modal && this.config.modal.title) ||
                  'Text-2-Speech Control';

    return html`
      <div class="modal-dialog modal-frame modal-top modal-notify modal-primary"
           data-bs-backdrop="static"
           data-bs-keyboard="false"
           tabindex="-1"
           role="document"
           aria-labelledby="Modal Speak2Me">
        <div class="modal-content">

          <div class="modal-header">
            <p class="lead">${title}</p>
            <button type="button"
                    class="btn-close"
                    aria-label="Close"
                    @click=${this._onExit}></button>
          </div>

          <div class="modal-body mt-4">
            <div class="settings-area mb-5" data-speak2me-ignore>

              <h2 class="ml-2 mt-4 mb-4">${s.voice_settings_title || 'Voice Settings'}</h2>

              <speak2me-range
                name="rate"
                label=${s.voice_speed_label || 'Speed:'}
                .min=${parseFloat(s.voice_speed_min ?? 0.1)}
                .max=${parseFloat(s.voice_speed_max ?? 2.0)}
                .step=${parseFloat(s.voice_speed_step ?? 0.1)}
                .value=${this.rate}
                @range-change=${this._onRangeChange}
              ></speak2me-range>

              <speak2me-range
                name="pitch"
                label=${s.voice_pitch_label || 'Pitch:'}
                .min=${parseFloat(s.voice_pitch_min ?? 0.1)}
                .max=${parseFloat(s.voice_pitch_max ?? 2.0)}
                .step=${parseFloat(s.voice_pitch_step ?? 0.1)}
                .value=${this.pitch}
                @range-change=${this._onRangeChange}
              ></speak2me-range>

              <speak2me-range
                name="volume"
                label=${s.voice_volume_label || 'Volume:'}
                .min=${parseFloat(s.voice_volume_min ?? 0)}
                .max=${parseFloat(s.voice_volume_max ?? 1.0)}
                .step=${parseFloat(s.voice_volume_step ?? 0.1)}
                .value=${this.volume}
                @range-change=${this._onRangeChange}
              ></speak2me-range>

              <speak2me-voice-select
                .voices=${this.voices}
                .selected=${this.selectedVoice}
                placeholder=${s.voice_select_title || 'Select a voice'}
                ignore-provider="eSpeak"
                @voice-change=${this._onVoiceChange}
              ></speak2me-voice-select>

              <h2 class="ml-2 mt-5 mb-3">${s.voice_control_title || 'Voice Control'}</h2>

              <speak2me-controls
                .speaking=${this.speaking}
                .paused=${this.paused}
                .labels=${{
                  speak:  s.speak_button_text  || 'Speak',
                  stop:   s.stop_button_text   || 'Stop',
                  pause:  s.pause_button_text  || 'Pause',
                  resume: s.resume_button_text || 'Resume',
                  exit:   s.exit_button_text   || 'Close',
                }}
                .btnStyles=${{
                  speak:  s.speak_button_style  || 'success',
                  stop:   s.stop_button_style   || 'danger',
                  pause:  s.pause_button_style  || 'warning',
                  resume: s.resume_button_style || 'info',
                  exit:   s.exit_button_style   || 'warning',
                }}
                @speak-click=${this._onSpeak}
                @stop-click=${this._onStop}
                @pause-click=${this._onPause}
                @resume-click=${this._onResume}
                @exit-click=${this._onExit}
              ></speak2me-controls>

            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// claude - improve SpeakToMe code using lit #1
if (!customElements.get('speak2me-modal')) {
  customElements.define('speak2me-modal', Speak2MeModal);
}
