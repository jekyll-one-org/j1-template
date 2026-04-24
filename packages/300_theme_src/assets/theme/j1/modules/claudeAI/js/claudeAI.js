/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/claudeAi/js/claudeAI.js (13)
 # Provides JS Core for J1 Module claudeAI
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

/* Version 1.0.12 for J1 Template */

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

// claude - accumulate IIFEs #1: all sub-modules (Storage, Toast, FileParsers,
// KnowledgeBase, AgentChat, AgentUI) and utility functions are now inside the
// UMD wrapper. This eliminates six duplicate consoleLog() definitions, shares
// isDev/consoleLogId/logger across all components, and encapsulates everything
// under the claudeAi namespace - matching the skipad.js architecture.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);          // AMD: let the loader call factory
  } else if (typeof exports === 'object') {
    module.exports = factory();   // CommonJS: call factory, export result
  } else {
    root['claudeAi'] = factory();   // Browser global: call factory, assign result
  }
}(this, function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  const consoleLogId  = Math.random().toString(36).substring(2, 8);
  const MODULE_NAME   = 'claudeAi.core';

  // ---------------------------------------------------------------------------
  // Module variables
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: module-global variable to hold
  // adapter-provided options (apiKey, model, maxOutputTokens, etc.)
  // so that AgentChat and AgentUI can consume sensitive data without
  // localStorage or modal-UI collection.
  var adapterOptions  = null;
  var isDev           = null;
  var logger          = log4javascript.getLogger(MODULE_NAME);

  // ---------------------------------------------------------------------------
  // Helper Functions (shared by all sub-modules)
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: single consoleLog() replaces six
  // duplicated copies that were previously defined in each IIFE.
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
        isDev ? console.log(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`) : null;
        break;
      case 'WARN':
        isDev ? console.warn(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`) : null;
        break;
      case 'ERROR':
        console.error(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`);
        break;
      default:
        isDev ? console.log(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`) : null;
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Utilities (shared by all sub-modules)
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: moved from standalone functions at
  // file level into the UMD closure so they share the module scope.
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function autoResizeInput(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  // claude - ChatBot sendBtn
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

  // ---------------------------------------------------------------------------
  // Storage - Persistent Storage Adapter
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: moved inside UMD wrapper. The local
  // IIFE is retained to produce a clean public API object, but now
  // shares consoleLog/isDev/consoleLogId from the enclosing scope.
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


  // ---------------------------------------------------------------------------
  // FilesAPI - Anthropic Files API adapter (beta)
  // ---------------------------------------------------------------------------

  // claude - files api #1: new sub-module that wraps the Anthropic Files API
  // (beta header files-api-2025-04-14). Provides upload, list, get, and delete
  // operations so that KB documents can be stored on Anthropic's servers and
  // referenced by file_id in Messages requests - eliminating the need to store
  // full document content in the browser's localStorage.
  const FilesAPI = (() => {

    const BETA_HEADER = 'files-api-2025-04-14';

    /* Get API key from adapter options */
    function getApiKey() {
      try {
        const s = AgentUI.getSettings();
        return s.apiKey || '';
      } catch {
        return (adapterOptions && adapterOptions.apiKey) || '';
      }
    }

    /**
     * Upload a file (Blob or File) to Anthropic Files API.
     * @param {Blob|File} blob    - The file data
     * @param {string}    filename - Display name (e.g. "document.pdf")
     * @returns {Promise<Object>}  - { id, filename, mime_type, size_bytes, ... }
     */
    async function upload(blob, filename) {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error('FilesAPI: no API key configured');

      // claude - files api #2: the Anthropic Files API requires a `purpose`
      // parameter in the multipart upload. Without it, the server returns 400
      // and no file data is stored - this was the root cause of uploads failing.
      const formData = new FormData();
      formData.append('purpose', 'assistants');
      formData.append('file', blob, filename);

      const resp = await fetch('https://api.anthropic.com/v1/files', {
        method: 'POST',
        headers: {
          'x-api-key':                              apiKey,
          'anthropic-version':                       '2023-06-01',
          'anthropic-beta':                          BETA_HEADER,
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: formData
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `Files API upload failed: ${resp.status}`);
      }

      return await resp.json();
    }

    /**
     * Upload plain text content as a PDF document via jsPDF so it can be
     * referenced as a document content block in Messages requests.
     * (The Files API only supports PDF/image as document blocks; .txt/.md
     * must be converted to PDF first.)
     * @param {string} text     - Plain text content
     * @param {string} title    - Document title / filename stem
     * @returns {Promise<Object>} - Files API response with file id
     */
    async function uploadTextAsPdf(text, title) {
      if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
        throw new Error('FilesAPI: jsPDF library not loaded - cannot convert text to PDF');
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      // simple text wrapping into A4 pages
      const pageWidth   = doc.internal.pageSize.getWidth();
      const pageHeight  = doc.internal.pageSize.getHeight();
      const margin      = 15;
      const lineHeight  = 6;
      const maxWidth    = pageWidth - margin * 2;
      let y             = margin;

      // title line
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, y);
      y += lineHeight * 2;

      // body
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);

      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }

      const pdfBlob = doc.output('blob');
      const safeName = (title || 'document').replace(/[^a-zA-Z0-9_\-\.]/g, '_').substring(0, 80) + '.pdf';

      return await upload(pdfBlob, safeName);
    }

    /**
     * Upload a raw PDF File/Blob directly.
     * @param {File|Blob} pdfBlob  - PDF data
     * @param {string}    filename - Original filename
     * @returns {Promise<Object>}  - Files API response
     */
    async function uploadPdf(pdfBlob, filename) {
      return await upload(pdfBlob, filename || 'document.pdf');
    }

    /**
     * Delete a file from Anthropic's storage.
     * @param {string} fileId - The file_id to delete
     * @returns {Promise<boolean>}
     */
    async function remove(fileId) {
      const apiKey = getApiKey();
      if (!apiKey) return false;

      try {
        const resp = await fetch(`https://api.anthropic.com/v1/files/${fileId}`, {
          method: 'DELETE',
          headers: {
            'x-api-key':                              apiKey,
            'anthropic-version':                       '2023-06-01',
            'anthropic-beta':                          BETA_HEADER,
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        });
        return resp.ok;
      } catch {
        return false;
      }
    }

    /**
     * List all files in the workspace.
     * @returns {Promise<Array>} - Array of file objects
     */
    async function list() {
      const apiKey = getApiKey();
      if (!apiKey) return [];

      try {
        const resp = await fetch('https://api.anthropic.com/v1/files', {
          method: 'GET',
          headers: {
            'x-api-key':                              apiKey,
            'anthropic-version':                       '2023-06-01',
            'anthropic-beta':                          BETA_HEADER,
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        });
        if (!resp.ok) return [];
        const data = await resp.json();
        return data.data || [];
      } catch {
        return [];
      }
    }

    /**
     * Get metadata for a single file.
     * @param {string} fileId
     * @returns {Promise<Object|null>}
     */
    async function get(fileId) {
      const apiKey = getApiKey();
      if (!apiKey) return null;

      try {
        const resp = await fetch(`https://api.anthropic.com/v1/files/${fileId}`, {
          method: 'GET',
          headers: {
            'x-api-key':                              apiKey,
            'anthropic-version':                       '2023-06-01',
            'anthropic-beta':                          BETA_HEADER,
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        });
        if (!resp.ok) return null;
        return await resp.json();
      } catch {
        return null;
      }
    }

    return { upload, uploadTextAsPdf, uploadPdf, remove, list, get, BETA_HEADER };
  })();


  // ---------------------------------------------------------------------------
  // Toast - Toast Notifications
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: moved inside UMD wrapper.
  const Toast = (() => {
    function show(message, type = 'info', duration = 3500) {
//    const container = document.getElementById('toastContainer');
      const container = document.getElementById('toastContainer');
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.innerHTML = `<span class="mdi mdi-${
        type === 'success' ? 'check-circle' :
        type === 'error' ? 'alert-circle' : 'information'
      }"></span><span class="ml-2">${message}</span>`;
      container.appendChild(el);
      requestAnimationFrame(() => el.classList.add('show'));
      setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 750);
      }, duration);
    }
    return { show };
  })();


  // ---------------------------------------------------------------------------
  // FileParsers - extract plain text from various formats
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: moved inside UMD wrapper. Removed
  // local consoleLog() duplicate - uses the shared module-level version.
  const FileParsers = (() => {

    /* Read a File object as text */
    function readAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('File could not be read.'));
        reader.readAsText(file);
      });
    }

    /* Read a File object as ArrayBuffer */
    function readAsArrayBuffer(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('File could not be read.'));
        reader.readAsArrayBuffer(file);
      });
    }

    /* Parse Markdown / plain text - strip frontmatter, return text */
    function parseMarkdown(text) {
      // strip YAML frontmatter
      let cleaned = text.replace(/^---[\s\S]*?---\n*/m, '');
      // strip Liquid tags
      cleaned = cleaned.replace(/\{%[\s\S]*?%\}/g, '');
      return cleaned.trim();
    }

    /* Parse AsciiDoc - strip attributes, directives, extract text */
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
      // replace asciidoc macros by newlines
      cleaned = cleaned.replace(/\w+::[^\[]*\[[^\]]*\]/g, '\n')
      // replace entire include/path containing a macro
      cleaned = cleaned.replace(/\S*\{\{[^}]*\}\}\S*/g, '\n');
      // replace dot headlines (like: .Process map)
      cleaned = cleaned.replace(/^\..+\n$/gm, '\n');
      // replace asciidoc attributes (like: {badge-j1--version-latest})
      cleaned = cleaned.replace(/\{.*\}/gm, '\n');
      // convert asciidoc link macros to plain HTML URLs
      cleaned = cleaned.replace(/link:(https?:\/\/[^\[]+)\[([^\]]*)\]/g, (match, url, text) => {
        const label = text.split(',')[0].trim() || url;
        return `<a href="${url}">${label}</a>`;
      });
      // replace asciidoc internal links (like "link:[SEO Quality Metrics, ]")
      cleaned = cleaned.replace(/link:\[[^\]]*\]/g, '\n');
      // strip multiple newlines
      cleaned = cleaned.replace(/\n{2,}/g, '\n');
      // strip multiple newlines (Windows)
      cleaned = cleaned.replace(/(\r?\n){2,}/g, '\n');      

      return cleaned.trim();
    }

    /* Extract text from PDF using pdf.js */
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
          throw new Error('PDF.js could not be loaded.');
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

    /* Route file to the correct parser */
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


  // ---------------------------------------------------------------------------
  // KnowledgeBase - Knowledge Base Manager
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: moved inside UMD wrapper. Removed
  // local consoleLog() duplicate - uses the shared module-level version.
  const KnowledgeBase = (() => {

    // claude - kb database #1: all KB documents are now stored under a single
    // localStorage key "ai-agent" instead of individual "kb-entry:" prefixed
    // keys. If the key is not found in localStorage, the module loads the
    // default KB from "/assets/data/apps/kb databse/knowledgebase.json".

    // claude - limit KB size #6: storage key, fallback path, and maxTokenSize
    // are read from YAML config via AgentUI.getSettings(). maxTokenSize is
    // measured in chars (not KB). Defaults are kept as constants for the case
    // when settings are not yet available.
    const DEFAULT_STORAGE_KEY      = 'ai-agent';
    const DEFAULT_FALLBACK_JSON    = '/assets/data/apps/claudeAi/knowledgebase.json';
    const DEFAULT_MAX_TOKEN_SIZE   = 120000;   // chars – from storage.maxTokenSize

    // claude - files api #1: manifest key stores only lightweight metadata
    // (fileId, title, type, charCount) - no document content. Full content
    // lives on Anthropic's servers, referenced by fileId.
    const MANIFEST_SUFFIX          = '-manifest';

    let entries = [];

    // claude - files api #1: flag to track whether Files API is available
    // (requires valid API key). Falls back to legacy localStorage mode
    // when false (e.g. during initial page load before adapter config).
    let filesApiEnabled = false;
//  let filesApiEnabled = true;

    // claude - files api #1: check if Files API mode is active
    function isFilesApiMode() {
      try {
        const s = AgentUI.getSettings();
        return filesApiEnabled && !!s.apiKey && (s.kbDelivery === 'filesApi');
      } catch {
        return false;
      }
    }

    // claude - limit KB size #6: helper to read KB storage config from YAML
    function getStorageConfig() {
      try {
        const s = AgentUI.getSettings();
        return {
          key:          s.storageKey          || DEFAULT_STORAGE_KEY,
          fallback:     s.storageFallback     || DEFAULT_FALLBACK_JSON,
          maxTokenSize: s.storageMaxTokenSize || DEFAULT_MAX_TOKEN_SIZE
        };
      } catch {
        return {
          key:          DEFAULT_STORAGE_KEY,
          fallback:     DEFAULT_FALLBACK_JSON,
          maxTokenSize: DEFAULT_MAX_TOKEN_SIZE
        };
      }
    }

    // claude - limit KB size #6: compute current total chars across all entries
    function getCurrentTotalChars() {
      return entries.reduce((sum, e) => sum + (e.charCount || 0), 0);
    }

    // claude - limit KB size #6: check if adding content would exceed maxTokenSize (chars)
    function wouldExceedLimit(newContentLength) {
      const cfg          = getStorageConfig();
      const currentChars = getCurrentTotalChars();
      return (currentChars + newContentLength) > cfg.maxTokenSize;
    }

    // claude - limit KB size #6: update the storage usage bar and text in the UI
    function updateStorageUsage() {
      const cfg          = getStorageConfig();
      const maxChars     = cfg.maxTokenSize;
      const currentChars = getCurrentTotalChars();
      const percentage   = maxChars > 0 ? Math.min((currentChars / maxChars) * 100, 100) : 0;

      // format large numbers with k suffix
      const fmtChars = (n) => n > 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

      const textEl = document.getElementById('kbStorageText');
      const barEl  = document.getElementById('kbStorageBarFill');

      if (textEl) {
        textEl.textContent = `${fmtChars(currentChars)} / ${fmtChars(maxChars)} chars (${percentage.toFixed(0)}%)`;
      }

      if (barEl) {
        barEl.style.width = percentage.toFixed(1) + '%';
        // color coding: green < 70%, yellow 70-90%, red > 90%
        barEl.classList.remove('warning', 'critical');
        if (percentage > 90) {
          barEl.classList.add('critical');
        } else if (percentage > 70) {
          barEl.classList.add('warning');
        }
      }
    }

    /* Generate a short unique id */
    function uid() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    }

    /* Detect file type for icon */
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
    // the single "ai-agent" key in localStorage.
    // claude - limit KB size #6: use config-based storage key
    // claude - files api #1: in filesApi mode, save only the manifest
    // (metadata + fileId, no content) under a separate manifest key.
    // In legacy mode, save full entries as before.
    /* Save ALL entries to storage under the configured key */
    async function saveAll() {
      const cfg = getStorageConfig();

      if (isFilesApiMode()) {
        // claude - files api #1: save lightweight manifest - strip content
        const manifest = entries.map(e => ({
          id:        e.id,
          fileId:    e.fileId || null,
          type:      e.type,
          title:     e.title,
          source:    e.source,
          charCount: e.charCount || 0,
          created:   e.created
        }));
        await Storage.set(cfg.key + MANIFEST_SUFFIX, JSON.stringify(manifest));
      } else {
        // legacy mode: save full entries including content
        await Storage.set(cfg.key, JSON.stringify(entries));
      }
    }

    /* Save single entry - adds to array, then persists all */
    async function saveEntry(entry) {
      // claude - kb database #1: individual entry save now delegates
      // to saveAll() so the full array is always stored under "ai agent".
      await saveAll();
    }

    /* Delete single entry from storage */
    async function deleteEntry(id) {
      // claude - files api #1: also delete the file from Anthropic's servers
      const entry = entries.find(e => e.id === id);
      if (entry && entry.fileId && isFilesApiMode()) {
        try {
          await FilesAPI.remove(entry.fileId);
          consoleLog('INFO', MODULE_NAME, `[KB] Deleted file from Files API: ${entry.fileId}`);
        } catch (err) {
          consoleLog('WARN', MODULE_NAME, `[KB] Files API delete failed for ${entry.fileId}: ${err.message}`);
        }
      }

      entries = entries.filter(e => e.id !== id);
      // claude - kb database #1: persist after removal
      await saveAll();
      renderList();
      Toast.show('Entry deleted.', 'success');
    }

    // claude - kb database #1: loadAll now reads from the single "ai agent"
    // key. If the key is absent or empty, the module fetches the default
    // knowledgebase from the fallback JSON file on the server.
    // claude - files api #1: in filesApi mode, load from manifest key.
    // If manifest is empty, load fallback JSON, upload each entry to Files API,
    // then save the manifest.
    /* Load all entries from storage (single key), with JSON file fallback */
    async function loadAll() {
      entries = [];
      // claude - limit KB size #6: read storage key and fallback from YAML config
      const cfg = getStorageConfig();

      // claude - files api #1: detect if Files API mode should be used
      try {
        const s = AgentUI.getSettings();
        filesApiEnabled = !!s.apiKey && (s.kbDelivery === 'filesApi');
      } catch {
        filesApiEnabled = false;
      }

      // --- Files API mode: load manifest ---
      if (isFilesApiMode()) {
        try {
          const raw = await Storage.get(cfg.key + MANIFEST_SUFFIX);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              entries = parsed;
              entries.sort((a, b) => (b.created || 0) - (a.created || 0));
              consoleLog('INFO', MODULE_NAME, `[KB] Loaded ${entries.length} entries from Files API manifest`);
              renderList();
              return;
            }
          }
        } catch { /* manifest missing or corrupt - fall through */ }

        // claude - files api #1: no manifest found - try fallback JSON and
        // upload each entry to Files API, building the manifest from scratch.
        try {
          const resp = await fetch(cfg.fallback);
          if (resp.ok) {
            const fallback = await resp.json();
            if (Array.isArray(fallback) && fallback.length > 0) {
              consoleLog('INFO', MODULE_NAME, `[KB] Uploading ${fallback.length} fallback entries to Files API ...`);
              for (const entry of fallback) {
                try {
                  const fileResult = await FilesAPI.uploadTextAsPdf(entry.content || '', entry.title || 'Untitled');
                  entries.push({
                    id:        entry.id || uid(),
                    fileId:    fileResult.id,
                    type:      entry.type || 'text',
                    title:     entry.title || 'Untitled',
                    source:    entry.source || '',
                    charCount: entry.charCount || (entry.content || '').length,
                    created:   entry.created || Date.now()
                  });
                } catch (uploadErr) {
                  consoleLog('WARN', MODULE_NAME, `[KB] Files API upload failed for "${entry.title}": ${uploadErr.message}`);
                }
              }
              if (entries.length > 0) {
                await saveAll();
                consoleLog('INFO', MODULE_NAME, `[KB] Files API manifest created with ${entries.length} entries`);
              }
            }
          }
        } catch (err) {
          consoleLog('WARN', MODULE_NAME, `[KB] Fallback upload to Files API failed: ${err.message}`);
        }

        entries.sort((a, b) => (b.created || 0) - (a.created || 0));
        renderList();
        return;
      }

      // --- Legacy mode: load from single localStorage key ---
      try {
        const raw = await Storage.get(cfg.key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            entries = parsed;
            entries.sort((a, b) => (b.created || 0) - (a.created || 0));
            renderList();
            return;
          }
        }
      } catch { /* key missing or corrupt - fall through to fallback */ }

      // claude - kb database #1: no "ai-agent" key found in localStorage -
      // attempt to load default KB data from the server-side JSON file.
      try {
        const resp = await fetch(cfg.fallback);
        if (resp.ok) {
          const fallback = await resp.json();
          if (Array.isArray(fallback) && fallback.length > 0) {
            entries = fallback;
            // persist so subsequent loads use localStorage
            await saveAll();
            consoleLog('INFO', MODULE_NAME, `[KB] Loaded ${entries.length} entries from fallback: ${cfg.fallback}`);
          }
        }
      } catch (err) {
        console.warn('[KB] Fallback knowledgebase could not be loaded:', err.message);
      }

      entries.sort((a, b) => (b.created || 0) - (a.created || 0));
      renderList();
    }

    /* Add a URL source */
    async function addUrl() {
      const input = document.getElementById('urlInput');
      const url = input.value.trim();
      if (!url) return Toast.show('Please enter an URL.', 'error');

      Toast.show('Load website ...', 'info');
      try {
        // Use a CORS proxy approach - or fetch directly if same-origin
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
          // CORS failure - inform user
          Toast.show('CORS - The content cannot be loaded directly. Please copy the page content and add it using "Paste Text" ...', 'error', 6000);
          return;
        }

        if (!text || text.length < 20) {
          Toast.show('No usable text found on the page.', 'error');
          return;
        }

        // Truncate very large pages
        if (text.length > 100000) text = text.substring(0, 100000);

        // claude - limit KB size #6: check storage limit before adding
        if (wouldExceedLimit(text.length)) {
          Toast.show('Storage limit reached - cannot add this URL. Remove entries or increase the limit.', 'error', 5000);
          return;
        }

        // claude - files api #1: upload to Files API when enabled
        let fileId = null;
        if (isFilesApiMode()) {
          try {
            Toast.show('Uploading to Files API ...', 'info');
            const fileResult = await FilesAPI.uploadTextAsPdf(text, url.replace(/^https?:\/\//, '').substring(0, 60));
            fileId = fileResult.id;
            consoleLog('INFO', MODULE_NAME, `[KB] URL content uploaded to Files API: ${fileId}`);
          } catch (uploadErr) {
            Toast.show('Files API upload failed: ' + uploadErr.message, 'error', 5000);
            return;
          }
        }

        const entry = {
          id: uid(),
          fileId,
          type: 'url',
          title: url.replace(/^https?:\/\//, '').substring(0, 80),
          source: url,
          content: isFilesApiMode() ? undefined : text,
          charCount: text.length,
          created: Date.now(),
        };
        entries.unshift(entry);
        await saveEntry(entry);
        input.value = '';
        renderList();
        Toast.show('Website added to the knowledgebase.', 'success');
      } catch (err) {
        Toast.show('Load error: ' + err.message, 'error');
      }
    }

    /* Handle file drop */
    function handleDrop(event) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      const files = event.dataTransfer.files;
      if (files.length) handleFiles(files);
    }

    /* Handle file uploads */
    async function handleFiles(fileList) {
      for (const file of fileList) {
        try {
          Toast.show(`Process: ${file.name} ...`, 'info');
          const text = await FileParsers.parseFile(file);

          if (!text || text.length < 5) {
            Toast.show(`No valid text found in ${file.name}.`, 'error');
            continue;
          }

          // claude - limit KB size #6: check storage limit before adding
          if (wouldExceedLimit(text.length)) {
            Toast.show(`Storage limit reached - cannot add ${file.name}.`, 'error', 5000);
            continue;
          }

          const name = file.name.toLowerCase();
          let type = 'text';
          if (name.endsWith('.md') || name.endsWith('.markdown')) type = 'markdown';
          else if (name.endsWith('.adoc') || name.endsWith('.asciidoc')) type = 'asciidoc';
          else if (name.endsWith('.pdf')) type = 'pdf';

          // claude - files api #1: upload to Files API when enabled
          let fileId = null;
          if (isFilesApiMode()) {
            try {
              Toast.show(`Uploading ${file.name} to Files API ...`, 'info');
              if (type === 'pdf') {
                // PDF files can be uploaded directly
                const fileResult = await FilesAPI.uploadPdf(file, file.name);
                fileId = fileResult.id;
              } else {
                // text-based files: convert to PDF first
                const fileResult = await FilesAPI.uploadTextAsPdf(text, file.name);
                fileId = fileResult.id;
              }
              consoleLog('INFO', MODULE_NAME, `[KB] File uploaded to Files API: ${fileId} (${file.name})`);
            } catch (uploadErr) {
              Toast.show(`Files API upload failed for ${file.name}: ${uploadErr.message}`, 'error', 5000);
              continue;
            }
          }

          const entry = {
            id: uid(),
            fileId,
            type,
            title: file.name,
            source: file.name,
            content: isFilesApiMode() ? undefined : (text.length > 100000 ? text.substring(0, 100000) : text),
            charCount: Math.min(text.length, 100000),
            created: Date.now(),
          };
          entries.unshift(entry);
          await saveEntry(entry);
          Toast.show(`${file.name} added.`, 'success');
        } catch (err) {
          Toast.show(`Error for ${file.name}: ${err.message}`, 'error');
        }
      }
      renderList();
      // Reset file input
      document.getElementById('fileInput').value = '';
    }

    /* Add pasted text */
    async function addPaste() {
      const title = document.getElementById('pasteTitle').value.trim() || 'Pasted Text';
      const content = document.getElementById('pasteContent').value.trim();
      if (!content) return Toast.show('Plese enter text.', 'error');

      // claude - limit KB size #6: check storage limit before adding
      if (wouldExceedLimit(content.length)) {
        Toast.show('Storage limit reached - cannot add this text. Remove entries or increase the limit.', 'error', 5000);
        return;
      }

      // claude - files api #1: upload to Files API when enabled
      let fileId = null;
      if (isFilesApiMode()) {
        try {
          Toast.show('Uploading text to Files API ...', 'info');
          const fileResult = await FilesAPI.uploadTextAsPdf(content, title);
          fileId = fileResult.id;
          consoleLog('INFO', MODULE_NAME, `[KB] Pasted text uploaded to Files API: ${fileId}`);
        } catch (uploadErr) {
          Toast.show('Files API upload failed: ' + uploadErr.message, 'error', 5000);
          return;
        }
      }

      const entry = {
        id: uid(),
        fileId,
        type: 'paste',
        title,
        source: 'Manual Input',
        content: isFilesApiMode() ? undefined : content,
        charCount: content.length,
        created: Date.now(),
      };
      entries.unshift(entry);
      await saveEntry(entry);
      document.getElementById('pasteTitle').value = '';
      document.getElementById('pasteContent').value = '';
      renderList();
      Toast.show('Added to the knowledgebase.', 'success');
    }

    /* Build the combined knowledge context for the AI prompt */
    // claude - files api #1: in legacy mode, returns the plain text context
    // string (unchanged). In filesApi mode, returns empty string - the
    // content blocks are built by buildContentBlocks() instead.
    function buildContext() {
      if (isFilesApiMode()) return '';
      if (!entries.length) return '';
      let ctx = '=== Knowledgebase ===\n\n';
      entries.forEach((e, i) => {
        const cleanedText = (e.content || '').replace(/\n+/g, '\n');
        ctx += `--- Document ${i + 1}: ${e.title} (${e.type}) ---\n`;
        ctx += cleanedText + '\n\n';
      });
      ctx += '=== END Knowledgebase ===';
      return ctx;
    }

    // claude - files api #1: build an array of content blocks that reference
    // KB documents via Files API file_id. Each entry becomes a document
    // content block that the Messages API resolves server-side - no document
    // content is sent from the browser.
    /**
     * Build content blocks for the Messages API (Files API mode).
     * @returns {Array} - Array of content block objects for the user message
     */
    function buildContentBlocks() {
      if (!isFilesApiMode() || !entries.length) return [];

      const blocks = [];
      for (const e of entries) {
        if (e.fileId) {
          blocks.push({
            type: 'document',
            source: {
              type: 'file',
              file_id: e.fileId
            },
            title:   e.title || 'KB Document',
            context: `Knowledge base document: ${e.title} (${e.type})`
          });
        }
      }
      return blocks;
    }

    /* Render entry list in sidebar */
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
        // claude - limit KB size #6: reset storage usage bar
        updateStorageUsage();
        return;
      }

      countEl.textContent = entries.length;
      totalDocsEl.textContent = entries.length;
      const totalChars = entries.reduce((sum, e) => sum + (e.charCount || 0), 0);
      totalCharsEl.textContent = totalChars > 1000
        ? (totalChars / 1000).toFixed(1) + 'k'
        : totalChars;

      // claude - limit KB size #6: update storage usage bar from YAML config
      updateStorageUsage();

      // claude - accumulate IIFEs #1: onclick handler now references
      // claudeAi.KnowledgeBase.deleteEntry() since KnowledgeBase is no
      // longer a standalone global but lives under the claudeAi namespace.
      container.innerHTML = entries.map(e => `
        <div class="kb-entry" data-id="${e.id}">
          <span class="kb-entry-icon mdi ${fileTypeIcon(e.type)}"></span>
          <div class="kb-entry-body">
            <div class="kb-entry-title">${escapeHtml(e.title)}</div>
            <div class="kb-entry-meta">
              ${e.type} · ${(e.charCount || 0).toLocaleString('en-US')} Characters</div>
            </div>
          <button class="kb-entry-delete"
            onclick="claudeAi.KnowledgeBase.deleteEntry('${e.id}')" title="Delete">
            <span class="mdi mdi-close"></span>
          </button>
        </div>
      `).join('');
    }

    /* Export all entries as JSON */
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

    /* Import entries from JSON file */
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
            // claude - limit KB size #6: check limit before each imported entry
            if (wouldExceedLimit(entry.content.length)) {
              Toast.show(`Storage limit reached - stopped after ${count} entries.`, 'error', 5000);
              break;
            }
            entry.id = uid(); // new id to avoid collisions
            entries.unshift(entry);
            count++;
          }
        }
        // claude - kb database #1: persist once after all entries are added,
        // avoiding repeated writes to the single "ai agent" key per entry.
        if (count > 0) await saveAll();
        renderList();
        Toast.show(`Entries imported: ${count}.`, 'success');
      } catch (err) {
        Toast.show('Import error: ' + err.message, 'error');
      }
      document.getElementById('importFileInput').value = '';
    }

    /* Clear all entries */
    async function clearAll() {
      if (!confirm('Delete all entries from the knowledge base?')) return;

      // claude - files api #1: delete all files from Anthropic's servers
      if (isFilesApiMode()) {
        Toast.show('Deleting files from Files API ...', 'info');
        for (const e of entries) {
          if (e.fileId) {
            try {
              await FilesAPI.remove(e.fileId);
            } catch { /* best effort */ }
          }
        }
      }

      // claude - limit KB size #6: remove the configured storage key
      entries = [];
      const cfg = getStorageConfig();
      await Storage.remove(cfg.key);
      await Storage.remove(cfg.key + MANIFEST_SUFFIX);
      renderList();
      Toast.show('Knowledge database emptied.', 'success');
    }

    return {
      loadAll, saveAll, addUrl, handleDrop, handleFiles, addPaste,
      deleteEntry, clearAll, buildContext, buildContentBlocks,
      exportAll, importAll
    };
  })();


  // ---------------------------------------------------------------------------
  // AgentChat - Chat Engine (Anthropic API)
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: moved inside UMD wrapper. Removed
  // local consoleLog() duplicate - uses the shared module-level version.
  const AgentChat = (() => {
    const HISTORY_KEY = 'agent-chat-history';

    let history     = []; // { role, content }
    let isStreaming = false;

    // -------------------------------------------------------------------------
    // generateHeaderId()
    // Generate a unique id used for MD/HTML headlines in the answers bubble
    // -------------------------------------------------------------------------
    function generateHeaderId(length = 8) {
     var result           = '';
     var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
     var charactersLength = characters.length;

     for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }

     return result;
    } // END generateId

    // Send a user message
    async function send() {
      const input = document.getElementById('chatInput');
      if (!input) return;
      const text = input.value.trim();
      if (!text || isStreaming) return;

      const settings    = AgentUI.getSettings();
      const HISTORY_KEY = settings.chatHistoryKey;

      if (!settings.apiKey) {
        Toast.show('Please enter an API key in the settings first.', 'error');
        AgentUI.openSettings();
        return;
      }

      // Hide welcome screen
      const welcome = document.getElementById('welcomeScreen');
      if (welcome) welcome.remove();

      // claude - add userPrompt #1: prepend the userPrompt prefix to the
      // content sent to the API so the request context is set (e.g. "J1 Template - ").
      // The UI chat bubble shows the original text without the prefix.
      // const userPrompt  = settings.userPrompt || '';
      // const apiContent  = userPrompt ? userPrompt + text : text;

      // claude - add userPrompt #1
      // Add user message (original text in UI)
      appendMessage('user', text);
//    history.push({ role: 'user', content: apiContent });
      history.push({ role: 'user', content: text });

      // reset the message input
      input.value = '';
      autoResizeInput(input);

      // Show typing indicator
      const typingEl = appendTyping();
      isStreaming = true;
      updateSendBtn();

      try {
        const kbContext = KnowledgeBase.buildContext();

        // Build system prompt
        let systemPrompt = settings.systemPrompt;

        // claude - accumulate IIFEs #1: append knowledge base context to
        // the system prompt so the AI can actually reference KB documents.
        // Previously kbContext was computed but never used in the API call.
        // claude - files api #1: only append text context in legacy mode.
        // In filesApi mode, KB documents are delivered as content blocks.
        if (kbContext) {
          systemPrompt += '\n\n' + kbContext;
        }

        // claude - files api #1: build the content blocks for the user
        // message. In filesApi mode, KB documents are sent as document
        // content blocks referencing file_ids on Anthropic's servers.
        // The user's text message is the last content block.
        const kbContentBlocks = KnowledgeBase.buildContentBlocks();
        const useFilesApi     = kbContentBlocks.length > 0;

        // claude - files api #1: build request headers - add beta header
        // when using Files API so the server accepts file_id references.
        const requestHeaders = {
          'Content-Type':                               'application/json',
          'x-api-key':                                  settings.apiKey,
          'anthropic-version':                          '2023-06-01',
          'anthropic-dangerous-direct-browser-access':  'true',
        };
        if (useFilesApi) {
          requestHeaders['anthropic-beta'] = FilesAPI.BETA_HEADER;
        }

        // claude - files api #1: in filesApi mode, rewrite the last user
        // message in history to be a multi-content array containing the
        // KB document blocks + the user text block. This ensures every
        // API call includes the KB context via file references.
        let messagesPayload;
        if (useFilesApi) {
          messagesPayload = history.map((msg, idx) => {
            if (idx === history.length - 1 && msg.role === 'user') {
              // last user message: prepend KB document blocks
              return {
                role: 'user',
                content: [
                  ...kbContentBlocks,
                  { type: 'text', text: msg.content }
                ]
              };
            }
            return msg;
          });
        } else {
          messagesPayload = history;
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            model: settings.model,
            max_tokens: parseInt(settings.maxOutputTokens) || 2048,
            system: systemPrompt,
            messages: messagesPayload,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        let assistantText = data.content
          .filter(b => b.type === 'text')
          .map(b => b.text)
          .join('\n');

        // claude - downgrade md headers in response #2
        // only downgrade when the response actually contains a level-1
        // heading (single '#'); avoids needlessly shifting h2-h6 that
        // are already at their correct depth.
        if (/^# [^#]/m.test(assistantText)) {
          assistantText = assistantText.replace(/^(#{1,5}) /gm, '$1# ');
        }

        // claude - add id to all md headlines #2
        // use generateHeaderId() to produce truly unique IDs for every
        // heading instead of slugifying the heading text (which creates
        // duplicates when the same heading appears more than once).
        //
        // assistantText = assistantText.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
        //   if (/\{#[\w-]+\}\s*$/.test(text)) return match;
        //   const id = generateHeaderId();
        //   return `${hashes} ${text.trim()} {#${id}}`;
        // });

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

    /* Append a chat message bubble */
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
          let html = marked.parse(content, {
            breaks: true,
            gfm: true,
          });

          // claude - add unique IDs to HTML headlines #2
          // use generateHeaderId() to produce truly unique IDs for every
          // heading instead of slugifying the heading text (which creates
          // duplicates when the same heading appears more than once).
          // The regex matches both bare <h1> tags AND tags that already
          // carry a text-based id attribute from marked.parse() (e.g.
          // <h3 id="steps-to-export">) and forcefully overwrites them
          // with a truly unique generated ID.
          html = html.replace(/<h([1-6])(?:\s[^>]*)?\s*>/gi, (match, level) => {
            const id = generateHeaderId();
            return `<h${level} id="${id}">`;
          });

          // claude - convert HTML anchors #1
          // rewrite every <a href="..."> so the link opens in a new
          // browser tab/window instead of navigating the current page.
          html = html.replace(/<a\s+(href="[^"]*")/gi, '<a target="_blank" rel="noopener noreferrer" $1');

          bubble.innerHTML = html;
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

      // when a new assistant message is added, scroll the page to the
      // top of the last assistant entry so it is visible to the user.
      if (role === 'assistant') {
        const allAssistant = container.querySelectorAll('.chat-msg.assistant');
        if (allAssistant.length > 0) {
          const lastAssistant = allAssistant[allAssistant.length - 1];
          scrollToElement(lastAssistant);
        }
      }

      tocbot.refresh();
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

    /* Clear chat history */
    async function clear() {
      const settings    = AgentUI.getSettings();
      const HISTORY_KEY = settings.chatHistoryKey;
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


  // ---------------------------------------------------------------------------
  // AgentUI - UI Controller
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: moved inside UMD wrapper. Removed
  // local consoleLog() duplicate - uses the shared module-level version.
  const AgentUI = (() => {

    function getSettings() {
      // Claude - class claudeAiHandler fixes #2: all four settings (apiKey,
      // model, systemPrompt, maxOutputTokens) are now supplied by the adapter
      // from YAML config. Nothing is user-editable; storage is not consulted.
      if (getSettings._cache) return getSettings._cache;
      // claude - accumulate IIFEs #1: reads directly from the module-global
      // adapterOptions instead of going through claudeAi.getAdapterOptions().
      const adapterOpts = (typeof adapterOptions === 'object' && adapterOptions)
        ? adapterOptions
        : {};

     // claude - add userPrompt #1: expose userPrompt from adapter config
      // claude - files api #1: expose kbDelivery mode from adapter config
      // claude - files api #2: read nested storage.* and chatHistory.*
      // properties safely (matching loadSettings), instead of flat names
      // like adapterOpts.kbDelivery that never exist on the adapter object.
      const stg = adapterOpts.storage     || {};
      const ch  = adapterOpts.chatHistory || {};
      return {
        apiKey:               adapterOpts.apiKey                || '',
        model:                adapterOpts.model                 || 'claude-haiku-4-5-20251001',
        systemPrompt:         adapterOpts.systemPrompt,
        maxInputTokens:       adapterOpts.maxInputTokens        || 512,
        maxOutputTokens:      adapterOpts.maxOutputTokens       || 2048,
        userPrompt:           adapterOpts.userPrompt            || 'J1 Template -',
        chatHistoryLocation:  ch.location                       || 'localstorage',
        chatHistoryKey:       ch.key                            || 'agent-chat-history',
        storageFallback:      stg.fallback                      || '/assets/data/apps/claudeAi/knowledgebase.json',
        storageLocation:      stg.location                      || 'localstorage',
        storageKey:           stg.key                           || 'ai-agent',
        storageMaxTokenSize:  stg.maxTokenSize                  || 120000,
        kbDelivery:           stg.delivery                      || 'localstorage'
      };
    }

    async function loadSettings() {
      // claude - files api #2: clear stale cache so the fresh adapter
      // options are always applied (the constructor calls loadSettings()
      // again after DOMContentLoaded already ran it with empty options).
      getSettings._cache = null;
      try {
        // Claude - class claudeAiHandler fixes #2: all four settings are
        // supplied by the adapter from YAML config. Browser storage is no
        // longer consulted - the adapter is the single source of truth.
        // claude - accumulate IIFEs #1: reads directly from the module-global
        // adapterOptions instead of going through claudeAi.getAdapterOptions().
        const adapterOpts = (typeof adapterOptions === 'object' && adapterOptions)
          ? adapterOptions
          : {};

        // claude - add userPrompt #1: include userPrompt in cached settings
        // claude - files api #1: include kbDelivery in cached settings
        // claude - files api #2: safely destructure nested objects so that
        // accessing e.g. chatHistory.location does not throw when the
        // adapter has not yet provided these sub-objects (DOMContentLoaded
        // fires before the adapter constructor runs).
        const stg = adapterOpts.storage     || {};
        const ch  = adapterOpts.chatHistory || {};
        getSettings._cache = {
          apiKey:               adapterOpts.apiKey                || '',
          model:                adapterOpts.model                 || 'claude-haiku-4-5-20251001',
          systemPrompt:         adapterOpts.systemPrompt,
          maxInputTokens:       adapterOpts.maxInputTokens        || 512,
          maxOutputTokens:      adapterOpts.maxOutputTokens       || 2048,
          userPrompt:           adapterOpts.userPrompt            || 'J1 Template -',
          chatHistoryLocation:  ch.location                       || 'localstorage',
          chatHistoryKey:       ch.key                            || 'agent-chat-history',
          storageFallback:      stg.fallback                      || '/assets/data/apps/claudeAi/knowledgebase.json',
          storageLocation:      stg.location                      || 'localstorage',
          storageKey:           stg.key                           || 'ai-agent',
          storageMaxTokenSize:  stg.maxTokenSize                  || 120000,
          kbDelivery:           stg.delivery                      || 'localstorage'
        };
      } catch { /* use defaults */ }
      updateStatusBar();
    }

    function updateStatusBar() {
      const s         = getSettings();
      const dot       = document.getElementById('statusDot');
      const text      = document.getElementById('statusText');
      const textInfo  = document.getElementById('statusTextInfo');
      const modelInfo = document.getElementById('modelInfo');

      if (!dot || !text || !modelInfo) return;

      if (s.apiKey) {
        dot.className         = 'status-dot connected';
        text.textContent      = 'ChatBot connected.';
        textInfo.textContent  = `NOTE - Your question should not exceed ${s.maxInputTokens} chars.`;
      } else {
        dot.className         = 'status-dot disconnected';
        text.textContent      = 'ChatBot disconnected.';
        textInfo.textContent  = 'NOTE - Please check your internet connection.';
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
           <h2 class="notoc">Welcome to the ChatBot</h2>
          <p>
            Ask your questions about SkipAd. The agent uses Claude
            AI and the information available on this website as
            its knowledge base for giving helpful answers.
          </p>
        </div>`;

        tocbot.refresh();
      }

    // claude - accumulate IIFEs #1: added missing openSettings() - called
    // by AgentChat.send() when no API key is configured, but was never
    // defined. Shows the settings modal overlay.
    function openSettings() {
      const modal = document.getElementById('settingsModal');
      if (modal) {
        modal.classList.add('active');
      }
    }

    // claude - accumulate IIFEs #1: added missing closeSettings() -
    // referenced in DOMContentLoaded backdrop-click handler and in the
    // HTML modal footer button, but was never defined. Hides the modal.
    function closeSettings() {
      const modal = document.getElementById('settingsModal');
      if (modal) {
        modal.classList.remove('active');
      }
    }

    function handleInputKey(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        AgentChat.send();

        // claude - ChatBot sendBtn
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
      getSettings, loadSettings, updateStatusBar,
      openSettings, closeSettings,
      clearChat, handleInputKey
    };
  })();


  // ---------------------------------------------------------------------------
  // claudeAiHandler
  // ---------------------------------------------------------------------------

  class claudeAiHandler {

    // constructor accepts options from the adapter (sourced from YAML
    // config) and stores them in the module-global adapterOptions so
    // that AgentChat, AgentUI, and any other module component can
    // access sensitive data (apiKey, etc.) without relying on browser
    // localStorage or modal-UI input.
    constructor(options) {
      // merge adapter options into the module-global store
      adapterOptions  = Object.assign({}, adapterOptions, options || {});
      isDev           = adapterOptions.isDev;

      consoleLog('INFO', MODULE_NAME, 'claudeAiHandler: adapter options received');

      if (adapterOptions.enabled) {
        consoleLog('INFO', MODULE_NAME, 'claudeAiHandler: API data provided via adapter config');
      } else {
        consoleLog('WARN', MODULE_NAME, 'claudeAiHandler: API data disabled in adapter config');
      }

      this.init();

      // claude - accumulate IIFEs #1: refresh the AgentUI settings
      // cache now that adapter-provided data (apiKey, etc.) is available.
      // AgentUI.loadSettings() may already have run during DOMContentLoaded
      // before the adapter called this constructor, so we re-trigger it.
      AgentUI.loadSettings();
    }

    /**
     * Initialize the handler - currently logs readiness.
     * @private
     */
    init() {
      consoleLog('INFO', MODULE_NAME, 'claudeAiHandler: initialized');
    }

    // public accessor so external code can read adapter-provided options
    getOptions() {
      return Object.assign({}, adapterOptions);
    }

  } // END claudeAiHandler


  // ---------------------------------------------------------------------------
  // Initialization - DOMContentLoaded
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: moved inside UMD wrapper so init
  // code can access all sub-modules directly from the closure scope.
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

    consoleLog('INFO', MODULE_NAME, '[ChatBot] Initialized - ready for requests.');
  });

  // ---------------------------------------------------------------------------
  // Module exports
  // ---------------------------------------------------------------------------

  // claude - accumulate IIFEs #1: all sub-modules are now exported
  // through the single claudeAi namespace. HTML onclick handlers that
  // previously referenced global names (e.g. KnowledgeBase.deleteEntry)
  // must now use claudeAi.KnowledgeBase.deleteEntry() instead.
  return {
    claudeAiHandler:     claudeAiHandler,
    getAdapterOptions:  function () { return Object.assign({}, adapterOptions); },

    // Sub-modules exposed for HTML onclick handlers and external access
    Storage:            Storage,
    FilesAPI:           FilesAPI,
    Toast:              Toast,
    FileParsers:        FileParsers,
    KnowledgeBase:      KnowledgeBase,
    AgentChat:          AgentChat,
    AgentUI:            AgentUI
  };

}));