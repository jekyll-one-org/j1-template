/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/aiAgent/js/aiAgent.js (4)
 # Provides JS Core for J1 Module aiAgent (claude)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

/* Version 1.0 for J1 Template */

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);          // AMD: let the loader call factory
  } else if (typeof exports === 'object') {
    module.exports = factory();   // CommonJS: call factory, export result
  } else {
    // Claude - class aiAgentHandler fixes: register as 'aiAgent' (was 'skipAd')
    root['aiAgent'] = factory();   // Browser global: call factory, assign result
  }
}(this, function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  const ENVIRONTMENT        = 'dev';
  // Claude - class aiAgentHandler fixes: added missing consoleLogId variable
  const consoleLogId        = Math.random().toString(36).substring(2, 8);
  // Claude - class aiAgentHandler fixes: corrected typo 'aiAgen' → 'aiAgent'
  const MODULE_NAME         = 'aiAgent.core';

  // ---------------------------------------------------------------------------
  // Claude - class aiAgentHandler fixes: module-global variable to hold
  // adapter-provided options (apiKey, model, maxOutputTokens, etc.)
  // so that AgentChat and AgentUI can consume sensitive data without
  // localStorage or modal-UI collection.
  // ---------------------------------------------------------------------------
  let _adapterOptions = {};

  // ---------------------------------------------------------------------------
  // aiAgentHandler
  // ---------------------------------------------------------------------------
  class aiAgentHandler {

    // Claude - class aiAgentHandler fixes: constructor now accepts options
    // from the adapter (sourced from YAML config) and stores them in the
    // module-global _adapterOptions so that AgentChat, AgentUI, and any
    // other module component can access sensitive data (apiKey, etc.)
    // without relying on browser localStorage or modal-UI input.
    constructor(options) {
      // merge adapter options into the module-global store
      _adapterOptions = Object.assign({}, _adapterOptions, options || {});

      consoleLog('INFO', MODULE_NAME, 'aiAgentHandler: adapter options received');

      if (_adapterOptions.enabled) {
        consoleLog('INFO', MODULE_NAME, 'aiAgentHandler: API data provided via adapter config');
      } else {
        consoleLog('WARN', MODULE_NAME, 'aiAgentHandler: API data disabled in adapter config');
      }

      this.init();

      // Claude - class aiAgentHandler fixes: refresh the AgentUI settings
      // cache now that adapter-provided data (apiKey, etc.) is available.
      // AgentUI.loadSettings() may already have run during DOMContentLoaded
      // before the adapter called this constructor, so we re-trigger it.
      if (typeof AgentUI !== 'undefined' && AgentUI.loadSettings) {
        AgentUI.loadSettings();
      }
    }

    /**
     * Initialize the handler — currently logs readiness.
     * @private
     */
    init() {
      consoleLog('INFO', MODULE_NAME, 'aiAgentHandler: initialized');
    }

    // Claude - class aiAgentHandler fixes: public accessor so external
    // code can read adapter-provided options if needed.
    getOptions() {
      return Object.assign({}, _adapterOptions);
    }

  } // END aiAgentHandler

  // ---------------------------------------------------------------------------
  // Helper Functions
  // ---------------------------------------------------------------------------

  /**
   * consoleLog - formatted console output with timestamp and unique ID
   * @param {string} level   - Log level: 'INFO', 'WARN', or 'ERROR'
   * @param {string} module  - Source module identifier
   * @param {string} message - Log message text
   */  
  function consoleLog(level, module, message) {
    const timestamp = new Date().toISOString().slice(11, 23);

    switch (level) {

      case 'INFO':
        (ENVIRONTMENT === 'dev') ? console.log(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`) : null;
        break;
      case 'WARN':
        (ENVIRONTMENT === 'dev') ? console.warn(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`) : null;
        break;
      case 'ERROR':
        console.error(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`);
        break;
      default:
        (ENVIRONTMENT === 'dev') ? console.log(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`) : null;
        break;
    }

  }

  return {
    aiAgentHandler: aiAgentHandler,
    // Claude - class aiAgentHandler fixes: expose adapter options so
    // AgentUI and AgentChat (defined outside the UMD closure) can
    // read sensitive data like apiKey without localStorage.
    getAdapterOptions: function () { return Object.assign({}, _adapterOptions); }
  };

}));



"use strict";
/* -----------------------------------------------------------------------------
   Persistent Storage Adapter
   =============================================================================
   Uses window.storage when available (Claude Artifacts), otherwise
   falls back to localStorage for standalone usage.
   ----------------------------------------------------------------------------- */
const Storage = (() => {

  // Detect environment
  const hasClaudeStorage = typeof window.storage !== 'undefined'
                        && typeof window.storage.get === 'function';

  async function get(key) {
    try {
      if (hasClaudeStorage) {
        const result = await window.storage.get(key);
        return result ? result.value : null;
      }
      return localStorage.getItem(key);
    } catch { return null; }
  }

  async function set(key, value) {
    try {
      if (hasClaudeStorage) {
        await window.storage.set(key, value);
      } else {
        localStorage.setItem(key, value);
      }
      return true;
    } catch { return false; }
  }

  async function remove(key) {
    try {
      if (hasClaudeStorage) {
        await window.storage.delete(key);
      } else {
        localStorage.removeItem(key);
      }
      return true;
    } catch { return false; }
  }

  async function list(prefix) {
    try {
      if (hasClaudeStorage) {
        const result = await window.storage.list(prefix);
        return result ? result.keys : [];
      }
      // localStorage fallback
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!prefix || k.startsWith(prefix)) keys.push(k);
      }
      return keys;
    } catch { return []; }
  }

  return { get, set, remove, list };
})();


/* -----------------------------------------------------------------------------
   Toast Notifications
   ----------------------------------------------------------------------------- */

const Toast = (() => {
  function show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="mdi mdi-${
      type === 'success' ? 'check-circle' :
      type === 'error' ? 'alert-circle' : 'information'
    }"></span><span>${message}</span>`;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 350);
    }, duration);
  }
  return { show };
})();


/* -----------------------------------------------------------------------------
   File Parsers — extract plain text from various formats
   ----------------------------------------------------------------------------- */

const FileParsers = (() => {

  /** Read a File object as text */
  function readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
      reader.readAsText(file);
    });
  }

  /** Read a File object as ArrayBuffer */
  function readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
      reader.readAsArrayBuffer(file);
    });
  }

  /** Parse Markdown / plain text — strip frontmatter, return text */
  function parseMarkdown(text) {
    // strip YAML frontmatter
    let cleaned = text.replace(/^---[\s\S]*?---\n*/m, '');
    // strip Liquid tags
    cleaned = cleaned.replace(/\{%[\s\S]*?%\}/g, '');
    return cleaned.trim();
  }

  /** Parse AsciiDoc — strip attributes, directives, extract text */
  function parseAsciidoc(text) {
    let cleaned = text;
    // strip YAML frontmatter if present
    cleaned = cleaned.replace(/^---[\s\S]*?---\n*/m, '');
    // strip Liquid
    cleaned = cleaned.replace(/\{%[\s\S]*?%\}/g, '');
    cleaned = cleaned.replace(/\{[a-zA-Z_-]+\}/g, '');
    // strip AsciiDoc directives
    cleaned = cleaned.replace(/^:.*?:\s+.*$/gm, '');
    cleaned = cleaned.replace(/^\/\/.*$/gm, '');
    cleaned = cleaned.replace(/^ifeval::.*$/gm, '');
    cleaned = cleaned.replace(/^endif::.*$/gm, '');
    cleaned = cleaned.replace(/^ifdef::.*$/gm, '');
    cleaned = cleaned.replace(/^ifndef::.*$/gm, '');
    cleaned = cleaned.replace(/^include::.*$/gm, '');
    cleaned = cleaned.replace(/^image::.*$/gm, '');
    // strip block markers
    cleaned = cleaned.replace(/^[=\-~\.]{4,}$/gm, '');
    // strip role markers
    cleaned = cleaned.replace(/^\[.*?\]\s*$/gm, '');
    return cleaned.trim();
  }

  /** Extract text from PDF using pdf.js */
  async function parsePDF(file) {
    const arrayBuffer = await readAsArrayBuffer(file);
    // pdf.js may be loaded as module or global
    let pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib && typeof globalThis.pdfjsLib !== 'undefined') {
      pdfjsLib = globalThis.pdfjsLib;
    }

    if (!pdfjsLib) {
      // Fallback: try dynamic import
      try {
        const mod = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
        pdfjsLib = mod;
      } catch {
        throw new Error('PDF.js konnte nicht geladen werden.');
      }
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(' ');
      if (text.trim()) pages.push(text.trim());
    }
    return pages.join('\n\n');
  }

  /** Route file to the correct parser */
  async function parseFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) {
      return await parsePDF(file);
    }
    const text = await readAsText(file);
    if (name.endsWith('.md') || name.endsWith('.markdown')) {
      return parseMarkdown(text);
    }
    if (name.endsWith('.adoc') || name.endsWith('.asciidoc')) {
      return parseAsciidoc(text);
    }
    // plain text
    return text.trim();
  }

  return { parseFile, parseMarkdown, parseAsciidoc };
})();


/* -----------------------------------------------------------------------------
   Knowledge Base Manager
   ----------------------------------------------------------------------------- */

const KnowledgeBase = (() => {

  // claude - kb database #1: all KB documents are now stored under a single
  // localStorage key "ai agent" instead of individual "kb-entry:" prefixed
  // keys. If the key is not found in localStorage, the module loads the
  // default KB from "/assets/data/apps/kb databse/knowledgebase.json".
  const STORAGE_KEY      = 'ai agent';
  const FALLBACK_JSON    = '/assets/data/apps/kb databse/knowledgebase.json';

  let entries = [];

  /** Generate a short unique id */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }

  /** Detect file type for icon */
  function fileTypeIcon(type) {
    const map = {
      url: 'mdi-web',
      markdown: 'mdi-language-markdown',
      asciidoc: 'mdi-format-text',
      pdf: 'mdi-file-pdf-box',
      text: 'mdi-text-box-outline',
      paste: 'mdi-content-paste',
    };
    return map[type] || 'mdi-file-outline';
  }

  // claude - kb database #1: persist the complete entries array under
  // the single "ai agent" key in localStorage.
  /** Save ALL entries to storage under the single "ai agent" key */
  async function saveAll() {
    await Storage.set(STORAGE_KEY, JSON.stringify(entries));
  }

  /** Save single entry — adds to array, then persists all */
  async function saveEntry(entry) {
    // claude - kb database #1: individual entry save now delegates
    // to saveAll() so the full array is always stored under "ai agent".
    await saveAll();
  }

  /** Delete single entry from storage */
  async function deleteEntry(id) {
    entries = entries.filter(e => e.id !== id);
    // claude - kb database #1: persist after removal
    await saveAll();
    renderList();
    Toast.show('Eintrag gelöscht', 'success');
  }

  // claude - kb database #1: loadAll now reads from the single "ai agent"
  // key. If the key is absent or empty, the module fetches the default
  // knowledgebase from the fallback JSON file on the server.
  /** Load all entries from storage (single key), with JSON file fallback */
  async function loadAll() {
    entries = [];

    try {
      const raw = await Storage.get(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          entries = parsed;
          entries.sort((a, b) => (b.created || 0) - (a.created || 0));
          renderList();
          return;
        }
      }
    } catch { /* key missing or corrupt — fall through to fallback */ }

    // claude - kb database #1: no "ai agent" key found in localStorage —
    // attempt to load default KB data from the server-side JSON file.
    try {
      const resp = await fetch(FALLBACK_JSON);
      if (resp.ok) {
        const fallback = await resp.json();
        if (Array.isArray(fallback) && fallback.length > 0) {
          entries = fallback;
          // persist so subsequent loads use localStorage
          await saveAll();
          console.log(`[KB] Loaded ${entries.length} entries from fallback: ${FALLBACK_JSON}`);
        }
      }
    } catch (err) {
      console.warn('[KB] Fallback knowledgebase could not be loaded:', err.message);
    }

    entries.sort((a, b) => (b.created || 0) - (a.created || 0));
    renderList();
  }

  /** Add a URL source */
  async function addUrl() {
    const input = document.getElementById('urlInput');
    const url = input.value.trim();
    if (!url) return Toast.show('Bitte eine URL eingeben.', 'error');

    Toast.show('Lade Webseite …', 'info');
    try {
      // Use a CORS proxy approach — or fetch directly if same-origin
      let text = '';
      try {
        const resp = await fetch(url);
        const html = await resp.text();
        // Extract readable text from HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Remove scripts, styles, nav, footer
        doc.querySelectorAll('script,style,nav,footer,header,aside,noscript,iframe')
           .forEach(el => el.remove());
        text = doc.body.innerText.replace(/\s+/g, ' ').trim();
      } catch {
        // CORS failure — inform user
        Toast.show('CORS-Fehler — Inhalt kann nicht direkt geladen werden. Bitte den Seiteninhalt kopieren und über "Text einfügen" hinzufügen.', 'error', 6000);
        return;
      }

      if (!text || text.length < 20) {
        Toast.show('Kein verwertbarer Text auf der Seite gefunden.', 'error');
        return;
      }

      // Truncate very large pages
      if (text.length > 100000) text = text.substring(0, 100000);

      const entry = {
        id: uid(),
        type: 'url',
        title: url.replace(/^https?:\/\//, '').substring(0, 80),
        source: url,
        content: text,
        charCount: text.length,
        created: Date.now(),
      };
      entries.unshift(entry);
      await saveEntry(entry);
      input.value = '';
      renderList();
      Toast.show('Webseite zur Wissensdatenbank hinzugefügt.', 'success');
    } catch (err) {
      Toast.show('Fehler beim Laden: ' + err.message, 'error');
    }
  }

  /** Handle file drop */
  function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const files = event.dataTransfer.files;
    if (files.length) handleFiles(files);
  }

  /** Handle file uploads */
  async function handleFiles(fileList) {
    for (const file of fileList) {
      try {
        Toast.show(`Verarbeite: ${file.name} …`, 'info');
        const text = await FileParsers.parseFile(file);

        if (!text || text.length < 5) {
          Toast.show(`Kein Text in ${file.name} gefunden.`, 'error');
          continue;
        }

        const name = file.name.toLowerCase();
        let type = 'text';
        if (name.endsWith('.md') || name.endsWith('.markdown')) type = 'markdown';
        else if (name.endsWith('.adoc') || name.endsWith('.asciidoc')) type = 'asciidoc';
        else if (name.endsWith('.pdf')) type = 'pdf';

        const entry = {
          id: uid(),
          type,
          title: file.name,
          source: file.name,
          content: text.length > 100000 ? text.substring(0, 100000) : text,
          charCount: Math.min(text.length, 100000),
          created: Date.now(),
        };
        entries.unshift(entry);
        await saveEntry(entry);
        Toast.show(`${file.name} hinzugefügt.`, 'success');
      } catch (err) {
        Toast.show(`Fehler bei ${file.name}: ${err.message}`, 'error');
      }
    }
    renderList();
    // Reset file input
    document.getElementById('fileInput').value = '';
  }

  /** Add pasted text */
  async function addPaste() {
    const title = document.getElementById('pasteTitle').value.trim() || 'Eingefügter Text';
    const content = document.getElementById('pasteContent').value.trim();
    if (!content) return Toast.show('Bitte Text eingeben.', 'error');

    const entry = {
      id: uid(),
      type: 'paste',
      title,
      source: 'Manuelle Eingabe',
      content,
      charCount: content.length,
      created: Date.now(),
    };
    entries.unshift(entry);
    await saveEntry(entry);
    document.getElementById('pasteTitle').value = '';
    document.getElementById('pasteContent').value = '';
    renderList();
    Toast.show('Text zur Wissensdatenbank hinzugefügt.', 'success');
  }

  /** Build the combined knowledge context for the AI prompt */
  function buildContext() {
    if (!entries.length) return '';
    let ctx = '=== WISSENSDATENBANK ===\n\n';
    entries.forEach((e, i) => {
      ctx += `--- Dokument ${i + 1}: ${e.title} (${e.type}) ---\n`;
      ctx += e.content + '\n\n';
    });
    ctx += '=== ENDE WISSENSDATENBANK ===';
    return ctx;
  }

  /** Render entry list in sidebar */
  function renderList() {
    const container = document.getElementById('kbEntries');
    const countEl = document.getElementById('entryCount');
    const totalDocsEl = document.getElementById('totalDocs');
    const totalCharsEl = document.getElementById('totalChars');

    if (!container) return;

    if (!entries.length) {
      container.innerHTML = `
        <p class="text-muted text-sm" style="text-align:center;padding:1rem 0;">
          No entries yet
        </p>`;
      countEl.textContent = '0';
      totalDocsEl.textContent = '0';
      totalCharsEl.textContent = '0';
      return;
    }

    countEl.textContent = entries.length;
    totalDocsEl.textContent = entries.length;
    const totalChars = entries.reduce((sum, e) => sum + (e.charCount || 0), 0);
    totalCharsEl.textContent = totalChars > 1000
      ? (totalChars / 1000).toFixed(1) + 'k'
      : totalChars;

    container.innerHTML = entries.map(e => `
      <div class="kb-entry" data-id="${e.id}">
        <span class="kb-entry-icon mdi ${fileTypeIcon(e.type)}"></span>
        <div class="kb-entry-body">
          <div class="kb-entry-title">${escapeHtml(e.title)}</div>
          <div class="kb-entry-meta">
            ${e.type} · ${(e.charCount || 0).toLocaleString('de-DE')} Characters</div>
          </div>
        <button class="kb-entry-delete"
          onclick="KnowledgeBase.deleteEntry('${e.id}')" title="Delete">
          <span class="mdi mdi-close"></span>
        </button>
      </div>
    `).join('');
  }

  /** Export all entries as JSON */
  async function exportAll() {
    if (!entries.length) return Toast.show('No data to export.', 'error');
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'j1-agent-knowledgebase.json';
    a.click();
    URL.revokeObjectURL(url);
    Toast.show('Export finished.', 'success');
  }

  /** Import entries from JSON file */
  async function importAll(fileList) {
    if (!fileList.length) return;
    try {
      const text = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = () => rej(new Error('Read error'));
        r.readAsText(fileList[0]);
      });
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error('Format invalid');
      let count = 0;
      for (const entry of imported) {
        if (entry.id && entry.content) {
          entry.id = uid(); // new id to avoid collisions
          entries.unshift(entry);
          count++;
        }
      }
      // claude - kb database #1: persist once after all entries are added,
      // avoiding repeated writes to the single "ai agent" key per entry.
      if (count > 0) await saveAll();
      renderList();
      Toast.show(`${count} Entries imported.`, 'success');
    } catch (err) {
      Toast.show('Import error: ' + err.message, 'error');
    }
    document.getElementById('importFileInput').value = '';
  }

  /** Clear all entries */
  async function clearAll() {
    if (!confirm('Delete all entries from the knowledge base?')) return;
    // claude - kb database #1: remove the single "ai agent" key
    // instead of iterating over individual entry keys.
    entries = [];
    await Storage.remove(STORAGE_KEY);
    renderList();
    Toast.show('Knowledge database emptied.', 'success');
  }

  return {
    loadAll, saveAll, addUrl, handleDrop, handleFiles, addPaste,
    deleteEntry, clearAll, buildContext, exportAll, importAll
  };
})();


/* -----------------------------------------------------------------------------
   Chat Engine — Anthropic API
   ----------------------------------------------------------------------------- */

const AgentChat = (() => {
  const HISTORY_KEY = 'agent-chat-history';
  let history = []; // { role, content }
  let isStreaming = false;

  /** Send a user message */
  async function send() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text || isStreaming) return;

    const settings = AgentUI.getSettings();
    if (!settings.apiKey) {
      Toast.show('Please enter an API key in the settings first.', 'error');
      AgentUI.openSettings();
      return;
    }

    // Hide welcome screen
    const welcome = document.getElementById('welcomeScreen');
    if (welcome) welcome.remove();

    // Add user message
    appendMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    autoResizeInput(input);

    // Show typing indicator
    const typingEl = appendTyping();
    isStreaming = true;
    updateSendBtn();

    try {
      const kbContext = KnowledgeBase.buildContext();

      // Build system prompt
      let systemPrompt = settings.systemPrompt || 'Always respond in the same language the user writes in. Match the language of each individual message.'

      if (kbContext) {
        systemPrompt += `\n\nA knowledge base is available to you. Use this information to answer questions. If the knowledge base contains relevant information, refer to it. If not, answer based on your general knowledge.\n\n${kbContext}`;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: settings.model,
          max_tokens: parseInt(settings.maxOutputTokens) || 2048,
          system: systemPrompt || 'Always respond in the same language the user writes in. Match the language of each individual message.',
          messages: history,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantText = data.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');

      // Remove typing, add response
      if (typingEl) typingEl.remove();
      appendMessage('assistant', assistantText);
      history.push({ role: 'assistant', content: assistantText });

      // persist conversation history to Storage
      await Storage.set(HISTORY_KEY, JSON.stringify(history));

    } catch (err) {
      if (typingEl) typingEl.remove();
      appendMessage('assistant',
        `API request failed: ${err.message}\n\nPlease check your API key and network connection.`);
      Toast.show('API error: ' + err.message, 'error', 5000);
    }

    isStreaming = false;
    updateSendBtn();
  }

  /** Append a chat message bubble */
  function appendMessage(role, content) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.innerHTML = role === 'assistant'
      ? '<span class="mdi mdi-robot-outline"></span>'
      : '<span class="mdi mdi-account"></span>';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';

    if (role === 'assistant') {
      // render Markdown
      try {
        bubble.innerHTML = marked.parse(content, {
          breaks: true,
          gfm: true,
        });
      } catch {
        bubble.textContent = content;
      }
    } else {
      bubble.textContent = content;
    }

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    // claude - Chat Agent sendBtn
    // When a new assistant message is added, scroll the page to the
    // top of the last assistant entry so it is visible to the user.
    if (role === 'assistant') {
      const allAssistant = container.querySelectorAll('.chat-msg.assistant');
      if (allAssistant.length > 0) {
        const lastAssistant = allAssistant[allAssistant.length - 1];
        scrollToElement(lastAssistant);
      }
    }
  }
  function appendTyping() {
    const container = document.getElementById('chatMessages');
    if (!container) return null;
    const msg = document.createElement('div');
    msg.className = 'chat-msg assistant';
    msg.id = 'typingMsg';

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.innerHTML = '<span class="mdi mdi-robot-outline"></span>';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
  }

  function updateSendBtn() {
    const btn = document.getElementById('sendBtn');
    if (btn) btn.disabled = isStreaming;
  }

  /** Clear chat history */
  async function clear() {
    history = [];
    await Storage.remove(HISTORY_KEY);
    const container = document.getElementById('chatMessages');
    if (container) container.innerHTML = '';
  }

  // load persisted history and render into chatMessages
  async function loadHistory() {
    try {
      const raw = await Storage.get(HISTORY_KEY);
      if (raw) {
        history = JSON.parse(raw);
        if (history.length > 0) {
          // Remove welcome screen when history exists
          const welcome = document.getElementById('welcomeScreen');
          if (welcome) welcome.remove();
          // guard chat-only container
          const chatEl = document.getElementById('chatMessages');
          if (!chatEl) return;
          // Render each saved message into the chat container
          for (const msg of history) {
            appendMessage(msg.role, msg.content);
          }
        }
      }
    } catch { /* ignore corrupt history */ }
  }

  return { send, clear, loadHistory };
})();


/* -----------------------------------------------------------------------------
   UI Controller
   ----------------------------------------------------------------------------- */

const AgentUI = (() => {

  // function toggleSidebar() {
  //   const sidebar = document.getElementById('sidebar');
  //   if (sidebar) sidebar.classList.toggle('collapsed');
  // }

  // function openSettings() {
  //   const modal = document.getElementById('settingsModal');
  //   if (!modal) return;
  //   const s = getSettings();
  //   // Claude - class aiAgentHandler fixes: API key is no longer editable
  //   // via the settings modal. It is supplied by the adapter from YAML config.
  //   // The apiKeyInput field is set to a masked placeholder and disabled.
  //   const apiKeyInput = document.getElementById('apiKeyInput');
  //   if (apiKeyInput) {
  //     if (s.apiKey) {
  //       apiKeyInput.value = '••••••••' + s.apiKey.slice(-6);
  //     } else {
  //       apiKeyInput.value = '';
  //       apiKeyInput.placeholder = 'Provided by site configuration';
  //     }
  //     apiKeyInput.disabled = true;
  //   }

  //   // Claude - class aiAgentHandler fixes #2: model, systemPrompt and
  //   // maxOutputTokens are now supplied by the adapter from YAML config.
  //   // The modal inputs are populated with the current values and disabled.
  //   const modelSelect = document.getElementById('modelSelect');
  //   if (modelSelect) {
  //     modelSelect.value = s.model || 'claude-haiku-4-5-20251001';
  //     modelSelect.disabled = true;
  //   }

  //   const systemPromptInput = document.getElementById('systemPromptInput');
  //   if (systemPromptInput) {
  //     systemPromptInput.value = s.systemPrompt || 'Always respond in the same language the user writes in. Match the language of each individual message.';
  //     if (!s.systemPrompt) {
  //       systemPromptInput.placeholder = 'Provided by site configuration';
  //     }
  //     systemPromptInput.disabled = true;
  //   }

  //   const maxOutputTokensInput = document.getElementById('maxOutputTokensInput');
  //   if (maxOutputTokensInput) {
  //     maxOutputTokensInput.value = s.maxOutputTokens || 2048;
  //     maxOutputTokensInput.disabled = true;
  //   }

  //   modal.classList.add('open');
  // }

  // function closeSettings() {
  //   const modal = document.getElementById('settingsModal');
  //   if (modal) modal.classList.remove('open');
  // }

  async function saveSettings() {
    // Claude - class aiAgentHandler fixes #2: all four settings (apiKey,
    // model, systemPrompt, maxOutputTokens) are now supplied by the adapter
    // from YAML config. Nothing is user-editable, so there is nothing
    // to persist to browser storage. Just close the modal.
    closeSettings();
  }

  function getSettings() {
    // Claude - class aiAgentHandler fixes #2: all four settings (apiKey,
    // model, systemPrompt, maxOutputTokens) are now supplied by the adapter
    // from YAML config. Nothing is user-editable; storage is not consulted.
    if (getSettings._cache) return getSettings._cache;
    const adapterOpts = (typeof aiAgent !== 'undefined' && aiAgent.getAdapterOptions)
      ? aiAgent.getAdapterOptions()
      : {};
    return {
      apiKey:           adapterOpts.apiKey          || '',
      model:            adapterOpts.model           || 'claude-haiku-4-5-20251001',
      systemPrompt:     adapterOpts.systemPrompt    || 'Always respond in the same language the user writes in. Match the language of each individual message.',
      maxOutputTokens:  adapterOpts.maxOutputTokens || 2048
    };
  }

  async function loadSettings() {
    try {
      // Claude - class aiAgentHandler fixes #2: all four settings are
      // supplied by the adapter from YAML config. Browser storage is no
      // longer consulted — the adapter is the single source of truth.
      const adapterOpts = (typeof aiAgent !== 'undefined' && aiAgent.getAdapterOptions)
        ? aiAgent.getAdapterOptions()
        : {};

      getSettings._cache = {
        apiKey:           adapterOpts.apiKey          || '',
        model:            adapterOpts.model           || 'claude-haiku-4-5-20251001',
        systemPrompt:     adapterOpts.systemPrompt    || 'Always respond in the same language the user writes in. Match the language of each individual message.',
        maxOutputTokens:  adapterOpts.maxOutputTokens || 2048
      };
    } catch { /* use defaults */ }
    updateStatusBar();
  }

  function updateStatusBar() {
    const s = getSettings();
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    const modelInfo = document.getElementById('modelInfo');
    if (!dot || !text || !modelInfo) return;
    if (s.apiKey) {
      dot.className = 'status-dot connected';
      text.textContent = 'Connected';
    } else {
      dot.className = 'status-dot disconnected';
      text.textContent = 'API-Key missing';
    }
    const modelLabels = {
      'claude-sonnet-4-20250514':   'Claude Sonnet 4',
      'claude-opus-4-20250514':     'Claude Opus 4',
      'claude-haiku-4-5-20251001':  'Claude Haiku 4'
    };
    modelInfo.textContent = modelLabels[s.model] || s.model;
  }

  async function clearChat() {
    await AgentChat.clear();
    // Re-add welcome
    const container = document.getElementById('chatMessages');
    if (!container) return;
    container.innerHTML = `
      <div id="welcomeScreen" class="chat-welcome">
        <span class="mdi mdi-robot-outline"></span>
        <h3>Welcome to the AI ​​Agent for J1 Template</h3>
        <p>
          Ask your questions about SkipAd. The agent uses Claude
          as AI and the information available on this website as
          its knowledge base for giving helpful answers.
        </p>
      </div>`;
  }

  function handleInputKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      AgentChat.send();

      // claude - Chat Agent sendBtn
      // Explicitly clear the textarea after handleInputKey triggers
      // a successful send, ensuring the input is reset.
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.value = '';
        autoResizeInput(chatInput);
      }
    }
  }

  return {
    // toggleSidebar, openSettings, closeSettings, 
    saveSettings, getSettings, loadSettings,
    updateStatusBar, clearChat, handleInputKey
  };
})();


/* -----------------------------------------------------------------------------
   Utilities
   ----------------------------------------------------------------------------- */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function autoResizeInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

// claude - Chat Agent sendBtn
// scrollToElement - scroll the page to the (vertical) top position
// of the given DOM element, with an offset for fixed navbars.
// Uses getBoundingClientRect for accurate positioning of elements
// nested inside scrollable containers (e.g. chatMessages).
function scrollToElement(elm) {
  if (!elm) return;
  const rect              = elm.getBoundingClientRect();
  const scrollOffset      = (window.innerWidth >= 720) ? -180 : -130;
  const position          = rect.top + window.pageYOffset + scrollOffset;
  window.scrollTo(0, position);
}


/* -----------------------------------------------------------------------------
   Initialization
   ----------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', async () => {

  // Load settings first
  await AgentUI.loadSettings();

  // Load knowledge base entries
  await KnowledgeBase.loadAll();

  // restore persisted chat history into chatMessages
  await AgentChat.loadHistory();

  // guard elements that may not exist in split docs
  // Wire up drop zone click → file input
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });
  }

  // Auto-resize chat input
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('input', () => autoResizeInput(chatInput));
  }

  // Close settings modal on backdrop click
  const settingsModal = document.getElementById('settingsModal');
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) AgentUI.closeSettings();
    });
  }

  // Value-aware background styling (J1 pattern)
  document.querySelectorAll('.kb-input').forEach(input => {
    const update = () => {
      input.setAttribute('data-value-filled', input.value.length > 0 ? 'true' : 'false');
    };
    input.addEventListener('input', update);
    input.addEventListener('change', update);
    update();
  });

  console.log('[Chat Agent] Initialized — ready for requests.');
});