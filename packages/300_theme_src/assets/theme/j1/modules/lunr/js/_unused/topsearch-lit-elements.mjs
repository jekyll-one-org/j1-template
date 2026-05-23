/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/searcher/topsearch-element.mjs
 # Lit web component for the J1 TopSearch modal body.
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # NOTE:
 #  This file is loaded as a native ES module:
 #    <script type="module" src=".../topsearch-element.js"></script>
 #  In production, vendor `lit` locally (npm i lit) and replace the CDN
 #  import below with a relative path or your bundler's resolution.
 # -----------------------------------------------------------------------------
*/

// claude - improve topSearch code using lit #1
// Import Lit from a CDN ESM endpoint. For production builds, swap this
// for a locally vendored copy of lit (e.g. './vendor/lit-all.min.js')
// so the site has no runtime CDN dependency.
import { LitElement, html, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

/**
 * claude - improve topSearch code using lit #1
 *
 * <j1-topsearch> custom element. Encapsulates the search input, the
 * inline clear button, the optional send-to-history icon, and the
 * results list that used to be rendered by Mustache.
 *
 * Design notes
 * ------------
 * 1. Light DOM rendering. createRenderRoot() returns `this`, so the
 *    component renders into its host element rather than a shadow
 *    root. This is deliberate: the existing uno.css targets IDs and
 *    classes (#search-query, #clear-topsearch, .top-search-input,
 *    .input-container, etc.) and a shadow root would isolate those
 *    selectors. Light DOM keeps every CSS rule in uno.css working
 *    unchanged.
 *
 * 2. Reactive visibility. The previous code required external JS to
 *    imperatively toggle the `d-none` class on #clear-topsearch on
 *    every keystroke. Here, the class binding `${hasQuery ? '' :
 *    'd-none'}` is derived from internal state, so the controller
 *    no longer needs to do that work.
 *
 * 3. Mustache replacement. The Mustache <script id="search-results-
 *    template"> block is no longer needed. Result items are rendered
 *    directly from the `results` property via Lit's html`` template
 *    literal, which handles escaping correctly and lets us bind
 *    event handlers without resorting to delegation.
 *
 * 4. Public API.
 *
 *    Properties / attributes:
 *      placeholder            string  -- placeholder text
 *      history-enabled        bool    -- show the send-to-history icon
 *      result-heading-lead    string  -- optional heading above results
 *      results                array   -- result documents (push to render)
 *
 *    Custom events (bubbling, composed):
 *      topsearch-query        { query }     -- on every input keystroke
 *      topsearch-clear        {}            -- when the user clears
 *      topsearch-submit       { query }     -- on Enter
 *      topsearch-send-to-history { query }  -- on send icon click
 *
 *    Methods:
 *      setResults(docs)        -- push results in (controller -> component)
 *      clear()                 -- programmatic clear
 *      focus()                 -- focus the input
 *
 * Migration note for the controller (lunr search JS):
 *   Old:  $('#search-query').on('input', ...)
 *         $('#clear-topsearch').on('click', ...)
 *         Mustache.render(template, { docs }) -> $('#search-results').html(...)
 *   New:  topsearchEl.addEventListener('topsearch-query', e => runSearch(e.detail.query))
 *         topsearchEl.addEventListener('topsearch-clear', () => clearSearch())
 *         topsearchEl.results = docs
 *
 *   The legacy ID-based hooks still work because the component renders
 *   light DOM with the original IDs. Migrate at your own pace.
 */
class J1TopSearch extends LitElement {

  // ---------------------------------------------------------------------------
  // Reactive properties
  // ---------------------------------------------------------------------------
  static properties = {
    placeholder:        { type: String },
    historyEnabled:     { type: Boolean, attribute: 'history-enabled' },
    resultHeadingLead:  { type: String,  attribute: 'result-heading-lead' },
    results:            { type: Array },
    // Internal state. Prefixed with _ and marked `state: true` so it is
    // not exposed as an attribute.
    _query:             { state: true },
  };

  constructor() {
    super();
    this.placeholder        = 'Your search expression ...';
    this.historyEnabled     = false;
    this.resultHeadingLead  = '';
    this.results            = [];
    this._query             = '';
  }

  // claude - improve topSearch code using lit #1
  // Render into the host element (light DOM) so the existing uno.css
  // selectors (#search-query, #clear-topsearch, .top-search-input,
  // .input-container, .top-search, .search-results, .list-search-results,
  // .result-item, .result-item-text, ...) keep matching.
  createRenderRoot() {
    return this;
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  render() {
    const hasQuery        = this._query.length > 0;
    const clearBtnClasses = `form-clear form-clear-searcher${hasQuery ? '' : ' d-none'}`;
    // send-to-history is hidden by default in uno.css (display: none).
    // Promote it to inline-block only when the feature is enabled AND
    // there is a query to send.
    const sendVisible     = this.historyEnabled && hasQuery;

    return html`
      ${this.historyEnabled
        ? html`<div id="search_history_select_wrapper"></div>`
        : nothing}

      <div id="navigator_nav_topsearch" class="top-search mr-4">
        <!-- INPUT Form -->
        <div class="form-group">
          <div class="input-group">

            <span class="input-group-addon">
              <i class="mdib mdib-magnify mdib-24px mr-3"></i>
            </span>

            <div class="input-container">
              <input
                id="search-query"
                class="top-search-input"
                type="text"
                name="quick-search-query"
                .value=${this._query}
                placeholder=${this.placeholder}
                data-value-filled=${hasQuery ? 'true' : 'false'}
                autocomplete="off"
                @input=${this._onInput}
                @keydown=${this._onKeyDown}>

              <button
                id="clear-topsearch"
                type="button"
                class=${clearBtnClasses}
                title="Clear search"
                aria-label="Clear search"
                @click=${this._onClearClick}>
                <i class="mdib mdib-close mdib-24px"></i>
              </button>
            </div>

            <span
              id="send-to-history"
              style=${sendVisible ? 'display:inline-block' : 'display:none'}
              @click=${this._onSendToHistory}>
              <i class="mdib mdib-send mdib-24px"></i>
            </span>

          </div>
        </div>
        <!-- END INPUT Form -->

        <!-- SEARCH Results -->
        <div class="search-results hide-scrollbar mt-5">
          <div id="search-results">
            ${this._renderResults()}
          </div>
        </div>
        <!-- END SEARCH Results -->
      </div>
    `;
  }

  // claude - improve topSearch code using lit #1
  // Replacement for the Mustache <script id="search-results-template">.
  // Same DOM shape, same class names, so the existing CSS in uno.css
  // (.list-search-results, .result-item, .result-item-text, etc.)
  // styles the output identically.
  _renderResults() {
    if (!this.results || this.results.length === 0) {
      return nothing;
    }

    return html`
      <ul class="list-search-results">
        ${this.results.map((doc) => html`
          <li>
            <h4 class="result-item">
              <a class="link-no-decoration" href=${doc.url} target="_blank">
                ${doc.title} · ${doc.tagline}
              </a>
            </h4>
            <p class="result-item-text small text-muted mt-2 mb-0">
              <i class="mdib mdib-calendar-blank mdib-18px mr-1"></i>${doc.displaydate}
            </p>
            <p class="result-item-text">${doc.description}</p>
            <p class="result-item-text small text-muted mb-3">
              <i class="mdib mdib-tag-text-outline mdib-18px mr-1"></i>
              <span class="sr-categories">
                ${(doc.categories || []).map((c) => html` ${c} · `)}
              </span>
              <i class="mdib mdib-tag mdib-18px mr-1 ml-2"></i>
              <span class="sr-tags">
                ${(doc.tags || []).map((t) => html` ${t} · `)}
              </span>
            </p>
          </li>
        `)}
      </ul>
    `;
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------
  _onInput(e) {
    this._query = e.target.value;
    this._emit('topsearch-query', { query: this._query });
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') {
      this.clear();
    } else if (e.key === 'Enter') {
      this._emit('topsearch-submit', { query: this._query });
    }
  }

  _onClearClick() {
    this.clear();
  }

  _onSendToHistory() {
    if (!this._query) return;
    this._emit('topsearch-send-to-history', { query: this._query });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Replace the results list. Triggers a re-render. */
  setResults(results) {
    this.results = Array.isArray(results) ? results : [];
  }

  /** Programmatic clear: empties the query and the results. */
  clear() {
    const wasEmpty = this._query.length === 0;
    this._query  = '';
    this.results = [];
    if (!wasEmpty) {
      this._emit('topsearch-clear', {});
    }
    // Refocus the input after the next render so keyboard users keep
    // typing without having to click back into the box.
    this.updateComplete.then(() => {
      const input = this.querySelector('#search-query');
      if (input) input.focus();
    });
  }

  /** Focus the input element. */
  focus() {
    const input = this.querySelector('#search-query');
    if (input) input.focus();
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, {
      detail,
      bubbles:  true,
      composed: true,
    }));
  }
}

// claude - improve topSearch code using lit #1
// Guard against double-registration if this module is accidentally
// imported more than once (e.g. during HMR or by two different
// generators).
if (!customElements.get('j1-topsearch')) {
  customElements.define('j1-topsearch', J1TopSearch);
}

export { J1TopSearch };
