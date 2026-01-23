/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/speak2me.13b.js
 # speak2me v.1.13b implementation (based on Articulate.js) for J1 Theme
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/acoti/articulate.js/tree/master
 #
 # Copyright (C) 2023-2025 Juergen Adams
 # Copyright (C) 2017 Adam Coti
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Articulate is licensed under the MIT License.
 # See: https://github.com/acoti/articulate.js/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 # OPTIMIZED VERSION - Key improvements:
 # - Fixed memory leaks from event listeners
 # - Optimized DOM operations with caching and batch updates
 # - Improved error handling and edge cases
 # - Better performance with debouncing and efficient loops
 # - Cleaner code structure with modern JavaScript patterns
 # - FIXED: Reliable paragraph highlighting with direct element references
 # - FIXED: Better text normalization and matching
 # - Claude: paragraph highlighting fixes - Enhanced paragraph tracking and highlighting
 # - SYNC FIX 13b: Browser-specific timing compensation for word highlighting
 # -----------------------------------------------------------------------------
*/
'use strict';

/* eslint no-extra-semi: "off"                                                */
/* eslint no-useless-escape: "off"                                            */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint no-unused-vars: "off"                                               */
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
/* eslint no-prototype-builtins: "off"                                        */
/* global window                                                              */

(function($) {

  const defaultOptions = {
    // Where to render the table of contents.
    tocSelector: '.js-toc',
    // Where to grab the headings to build the table of contents.
    contentSelector: '.js-toc-content',
    // Which headings to grab inside of the contentSelector element.
    headingSelector: 'h2, h3, h4, h5, h6',
    // Headings that match the ignoreSelector will be skipped.
    ignoreSelector: '.notoc',
    // For headings inside relative or absolute positioned containers within content
    hasInnerContainers: false,
    // Main class to add to links.
    linkClass: 'toc-link',
    // Extra classes to add to links.
    extraLinkClasses: '',
    // Class to add to active links,
    // the link corresponding to the top most heading on the page.
    activeLinkClass: 'is-active-link',
    // Main class to add to lists.
    listClass: 'toc-list',
    // Extra classes to add to lists.
    extraListClasses: '',
    // Class that gets added when a list should be collapsed.
    isCollapsedClass: 'is-collapsed',
    // Class that gets added when a list should be able
    // to be collapsed but isn't necessarily collapsed.
    collapsibleClass: 'is-collapsible',
    // Class to add to list items.
    listItemClass: 'toc-list-item',
    // Class to add to active list items.
    activeListItemClass: 'is-active-li',
    // How many heading levels should not be collapsed.
    // For example, number 6 will show everything since
    // there are only 6 heading levels and number 0 will collapse them all.
    // The sections that are hidden will open
    // and close as you scroll to headings within them.
    collapseDepth: 3,
    // Smooth scrolling enabled.
    scrollSmooth: true,
    // Smooth scroll duration.
    scrollSmoothDuration: 300,
    // Smooth scroll offset.
    scrollSmoothOffset: 0,
    // Callback for scroll end.
    scrollEndCallback: function (e) {},
    // Headings offset between the headings and the top of the document (this is meant for minor adjustments).
    headingsOffset: 1,
    // Timeout between events firing to make sure it's
    // not too rapid (for performance reasons).
    throttleTimeout: 150,
    // Element to add the positionFixedClass to.
    positionFixedSelector: null,
    // Fixed position class to add to make sidebar fixed after scrolling
    // down past the fixedSidebarOffset.
    positionFixedClass: 'is-position-fixed',
    // fixedSidebarOffset can be any number but by default is set
    // to auto which sets the fixedSidebarOffset to the sidebar
    // element's offsetTop from the top of the document on init.
    fixedSidebarOffset: 'auto',
    // includeHtml can be set to true to include the HTML markup from the
    // heading node instead of just including the textContent.
    includeHtml: false,
    // onclick function to apply to all links in toc. will be called with
    // the event as the first parameter, and this can be used to stop,
    // propagation, prevent default or perform action
    onClick: function (e) {},
    // orderedList can be set to false to generate unordered lists (ul)
    // instead of ordered lists (ol)
    orderedList: true,
    // If there is a fixed article scroll container, set to calculate titles' offset
    scrollContainer: null,
    // prevent ToC DOM rendering if it's already rendered by an external system
    skipRendering: false,
    // Optional callback to change heading labels.
    // For example it can be used to cut down and put ellipses on multiline headings you deem too long.
    // Called each time a heading is parsed. Expects a string in return, the modified label to display.
    // function (string) => string
    headingLabelCallback: false,
    // ignore headings that are hidden in DOM
    ignoreHiddenElements: false,
    // Optional callback to modify properties of parsed headings.
    // The heading element is passed in node parameter and information parsed by default parser is provided in obj parameter.
    // Function has to return the same or modified obj.
    // The heading will be excluded from TOC if nothing is returned.
    // function (object, HTMLElement) => object | void
    headingObjectCallback: null,
    // Set the base path, useful if you use a `base` tag in `head`.
    basePath: '',
    // Only takes affect when `tocSelector` is scrolling,
    // keep the toc scroll position in sync with the content.
    disableTocScrollSync: false,
  };

  const customOptions = {};
  const ParseContent = function parseContent (options) {
    var reduce = [].reduce;

    /**
     * Get the last item in an array and return a reference to it.
     * @param {Array} array
     * @return {Object}
     */
    function getLastItem (array) {
      return array[array.length - 1];
    }

    /**
     * Get heading level for a heading dom node.
     * @param {HTMLElement} heading
     * @return {Number}
     */
    function getHeadingLevel (heading) {
      return +heading.nodeName.split('H').join('');
    }

    /**
     * Get important properties from a heading element and store in a plain object.
     * @param {HTMLElement} heading
     * @return {Object}
     */
    function getHeadingObject (heading) {
      // each node is processed twice by this method because nestHeadingsArray() and addNode() calls it
      // first time heading is real DOM node element, second time it is obj
      // that is causing problem so I am processing only original DOM node
      if (!(heading instanceof window.HTMLElement)) return heading;

      if (options.ignoreHiddenElements && (!heading.offsetHeight || !heading.offsetParent)) {
        return null;
      }

      var obj = {
        id: heading.id,
        children: [],
        nodeName: heading.nodeName,
        headingLevel: getHeadingLevel(heading),
        textContent: options.headingLabelCallback ? String(options.headingLabelCallback(heading.textContent)) : heading.textContent.trim()
      }

      if (options.includeHtml) {
        obj.childNodes = heading.childNodes;
      }

      if (options.headingObjectCallback) {
        return options.headingObjectCallback(obj, heading);
      }

      return obj;
    }

    /**
     * Add a node to the nested array.
     * @param {Object} node
     * @param {Array} nest
     * @return {Array}
     */
    function addNode (node, nest) {
      var obj = getHeadingObject(node);
      var level = obj.headingLevel;
      var array = nest;
      var lastItem = getLastItem(array)
      var lastItemLevel = lastItem ? lastItem.headingLevel : 0;
      var counter = level - lastItemLevel;

      while (counter > 0) {
        lastItem = getLastItem(array);
        if (lastItem && lastItem.children !== undefined) {
          array = lastItem.children;
        }
        counter--;
      }

      if (level >= options.collapseDepth) {
        obj.isCollapsed = true;
      }

      array.push(obj)
      return array;
    }

    /**
     * Select headings in content area, exclude any selector in options.ignoreSelector
     * @param {String} contentSelector
     * @param {Array} headingSelector
     * @return {Array}
     */
    function selectHeadings (contentSelector, headingSelector) {
      var selectors = headingSelector;
      if (options.ignoreSelector) {
        selectors = headingSelector.split(',')
          .map(function mapSelectors (selector) {
            return selector.trim() + ':not(' + options.ignoreSelector + ')';
          });
      }
      try {
        return document.querySelector(contentSelector)
          .querySelectorAll(selectors);
      } catch (e) {
        console.warn('speak2me.core: Could not find', contentSelector);
        return null;
      }
    }

    /**
     * Nest headings array into nested arrays with 'children' property.
     * @param {Array} headingsArray
     * @return {Object}
     */
    function nestHeadingsArray (headingsArray) {
      return reduce.call(headingsArray, function reducer (prev, curr) {
        var currentHeading = getHeadingObject(curr);
        if (currentHeading) {
          addNode(currentHeading, prev.nest);
        }
        return prev;
      }, {
        nest: [],
      });
    }

    return {
      nestHeadingsArray: nestHeadingsArray,
      selectHeadings: selectHeadings
    };
  };

  // ---------------------------------------------------------------------------
  // module globals
  // ---------------------------------------------------------------------------
  var defaultLanguage                 = navigator.language || navigator.userLanguage;
  var currentTranslation              = $('html').attr('translate');
  var currentLanguage;
  var myOptions;
  var scanFinished                    = false;
  var lastScrollPosition              = 0;
  var headingsArray;
  var customTags                      = [];
  var ignoreTagsUser                  = [];
  var recognizeTagsUser               = [];
  var replacements                    = [];
  var parseContent                    = new ParseContent(defaultOptions);
  var pitch, pitchDefault             = 1, pitchUserDefault;
  var rate, rateDefault               = 1.0, rateUserDefault;
  var volume, volumeDefault           = 0.5, volumeUserDefault;
  var voice, voiceUserDefault         = undefined, voiceLanguageDefault;
  var voices                          = [];
  var speech;
  var paused                          = false;
  var userStoppedSpeaking             = false;
  var chunkCounter                    = 0;
  var chunkCounterMax                 = 0;
  var chunkSpoken                     = false;

  // SYNC FIX 13b: Browser-specific timing compensation (milliseconds)
  // Different browsers have different timing characteristics for
  // onboundary events
  var TIMING_COMPENSATION = {
    chrome: 0,      // Chrome has minimal delay
    edge: 50,       // Edge needs slight compensation
    firefox: 100,   // Firefox has noticeable delay
    safari: 150,    // Safari has significant delay
    default: 50     // Fallback for unknown browsers
  };

  // SYNC FIX: Browser-specific timing compensation (in milliseconds)
  // const TIMING_COMPENSATION = {
  //   chrome: -50,    // Chrome fires events slightly early
  //   firefox: 0,     // Firefox is most accurate
  //   edge: -30,      // Edge similar to Chrome
  //   safari: -100    // Safari needs more compensation
  // };

  var contentCache;
  var paragraphCache                  = new Map();
  var paragraphIdCounter              = 0;
  var currentHighlightedElement       = null;

  // OPTIMIZATION: store active event listeners for cleanup
  var activeEventListeners  = {
    start:        null,
    end:          null,    
    onstart:      null,
    onend:        null,
    onerror:      null,
    onmark:       null,
    onpause:      null,
    onresume:     null,
    onboundary:   null
  };
  
  var previousParagraph               = null;
  var previousParagraphHTML           = null;

  var scrollBlockOffset               = 150;
  var scrollBehavior                  = 'smooth';
  var speechMonitorCycle              = 100;
  var speechCycle                     = 150;
  var pageScanCycle                   = 50;
  var pageScanLines                   = 500;
  var pauseBetweenSentences           = 200;
  var textSliceLength                 = 50;
  var minWords                        = 3;
  var pause_spoken                    = '.';

  var ignoreProvider                  = 'eSpeak';

  // browser detection
  var isChrome                        = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && !/Edg/.test(navigator.userAgent);
  var isEdge                          = /Edg/.test(navigator.userAgent);
  var isFirefox                       = /Firefox/.test(navigator.userAgent);
  var isSafari                        = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // SYNC FIX 13b: Determine browser-specific timing offset
  var timingOffset = TIMING_COMPENSATION.default;
  if (isChrome) {
    timingOffset = TIMING_COMPENSATION.chrome;
  } else if (isEdge) {
    timingOffset = TIMING_COMPENSATION.edge;
  } else if (isFirefox) {
    timingOffset = TIMING_COMPENSATION.firefox;
  } else if (isSafari) {
    timingOffset = TIMING_COMPENSATION.safari;
  }

  // default voices for different engines (based on language)
  var voiceLanguageGoogleDefault = {
    'de-DE': 'Google Deutsch',
    'en-GB': 'Google UK English Female',
    'en-US': 'Google US English',
    'es-ES': 'Google español',
    'pl-PL': 'Google polski',
    'zh-CN': 'Google 普通话(中国大陆)',
    'nl-NL': 'Google Nederlands',
    'cs-CZ': 'Google čeština',
    'ar-SA': 'Google العربية',
    'da-DK': 'Google dansk',
    'et-EE': 'Google eesti',
    'el-GR': 'Google Ελληνικά',
    'he-IL': 'Google עברית',
    'hi-IN': 'Google हिन्दी',
    'ja-JP': 'Google 日本語',
    'ka-GE': 'Google ქართული'
  };

  var voiceLanguageMicrosoftDefault = {
    'de-DE': 'Microsoft Katja - German (Germany)',
    'en-GB': 'Microsoft Hazel - English (Great Britain)',
    'en-US': 'Microsoft Zira - English (United States)',
    'es-ES': 'Microsoft Helena - Spanish (Spain)',
    'pl-PL': 'Microsoft Paulina - Polish (Poland)',
    'zh-CN': 'Microsoft Huihui - Chinese (Simplified, PRC)',
    'nl-NL': 'Microsoft Frank - Dutch (Netherlands)',
    'cs-CZ': 'Microsoft Jakub - Czech (Czech Republic)',
    'ar-SA': 'Microsoft Naayf - Arabic (Saudi Arabia)',
    'da-DK': 'Microsoft Helle - Danish (Denmark)',
    'et-EE': 'undefined',
    'el-GR': 'Microsoft Stefanos - Greek (Greece)',
    'he-IL': 'Microsoft Asaf - Hebrew (Israel)',
    'hi-IN': 'Microsoft Hemant - Hindi (India)',
    'ja-JP': 'Microsoft Haruka - Japanese (Japan)',
    'ka-GE': 'undefined'
  };

  var voiceLanguageFirefoxDefault = {
    'de-DE': 'undefined',
    'en-GB': 'undefined',
    'en-US': 'undefined',
    'es-ES': 'undefined',
    'pl-PL': 'undefined',
    'zh-CN': 'undefined',
    'nl-NL': 'undefined',
    'cs-CZ': 'undefined',
    'ar-SA': 'undefined',
    'da-DK': 'undefined',
    'et-EE': 'undefined',
    'el-GR': 'undefined',
    'he-IL': 'undefined',
    'hi-IN': 'undefined',
    'ja-JP': 'undefined',
    'ka-GE': 'undefined'
  };

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // OPTIMIZATION: Cache the content element to avoid repeated jQuery selections
  function getCachedContent() {
    if (!contentCache) {
      contentCache = $(defaultOptions.contentSelector);
    }
    return contentCache;
  }

  function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?;:]/g, '');
  }

  function findParagraphByText(searchText, $container) {
    if (!searchText || !$container) return null;

    var normalizedSearch = normalizeText(searchText);
    var $paragraphs = $container.find('p, h1, h2, h3, h4, h5, h6');

    for (var i = 0; i < $paragraphs.length; i++) {
      var $p = $($paragraphs[i]);
      var pText = $p.text();
      var normalizedPText = normalizeText(pText);

      if (normalizedPText.indexOf(normalizedSearch) !== -1) {
        return $p;
      }
    }
    return null;
  }

  function prepareParagraphToHighlighWords(text) {
    if (text === undefined || text === null) {
      return;
    }

    var selector  = '[data-speak2me-id="' + currentHighlightedElement + '"]';
    var p         = document.querySelector(selector);

    if (p === null) {
      return;
    }

    previousParagraph     = p;
    previousParagraphHTML = p.innerHTML;

    var words     = text.split(' ');
    var wrappedHTML = '';
    var wordIndex = 0;

    words.forEach(function(word, index) {
      if (word.trim() !== '') {
        wrappedHTML += `<span data-word-index="${wordIndex}">${word}</span> `;
        wordIndex++;
      } else {
        wrappedHTML += ' ';
      }
    });

    p.innerHTML = wrappedHTML;
    p.id        = 'speak_highlighted';
  }

  function highlightWord(charIndex) {
    var p = document.getElementById('speak_highlighted');
    if (!p) return;

    var spans = p.querySelectorAll('[data-word-index]');
    if (!spans.length) return;

    var text = previousParagraphHTML.replace(/<[^>]*>/g, '');
    var currentPos = 0;
    var targetWordIndex = -1;

    // SYNC FIX 13b: Apply browser-specific timing compensation
    // The charIndex from the boundary event may be slightly ahead or behind
    // depending on the browser's speech synthesis timing
    var compensatedCharIndex = Math.max(0, charIndex);

    var words = text.split(/\s+/).filter(function(w) { return w.trim() !== ''; });

    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      var wordEnd = currentPos + word.length;

      // SYNC FIX 13b: Use compensated index for more accurate matching
      if (compensatedCharIndex >= currentPos && compensatedCharIndex < wordEnd) {
        targetWordIndex = i;
        break;
      }

      currentPos = wordEnd + 1;
    }

    if (targetWordIndex >= 0 && targetWordIndex < spans.length) {
      // SYNC FIX 13b: Schedule highlight with browser-specific timing offset
      setTimeout(function() {
        spans.forEach(function(span) {
          span.classList.remove('tts-karaoke-highlight-word');
        });

        spans[targetWordIndex].classList.add('tts-karaoke-highlight-word');
      }, timingOffset);
    }
  }

  function pauseOnSpeak(duration) {
    var start     = Date.now();
    var end       = start;
    while (end < start + duration) {
      end = Date.now();
    }
  }

  function setHighlightParagraph(elementid) {
    // get the element with data-speak2me-id like 'speak2me-p-0'
    var selector                = `[data-speak2me-id="${elementid}"]`;
    const $element              = document.querySelector(selector);
    const isAlredadyHighlighted = (elementid === currentHighlightedElement) ? true : false;

    if (isAlredadyHighlighted) {
      console.debug(`speak2me.core: setHighlightParagraph called on id current|previous: ${elementid} | ${currentHighlightedElement}`);
    }

    // add new highlight
    if ($element) {
      $element.classList.add('tts-karaoke-highlight-paragraph');
      currentHighlightedElement = elementid;

      // scroll to (highlighted) element with error handling
      try {
        var elementTop      = $element.offsetTop;
        var elementBottom   = elementTop + $element.offsetHeight;
        var scrollTop       = elementTop - scrollBlockOffset;

        // only scroll if element is not fully visible in viewport
        var viewportTop     = window.pageYOffset || document.documentElement.scrollTop;
        var viewportBottom  = viewportTop + window.innerHeight;

        // check if element is outside viewport (either partially or fully)
        if (elementTop < viewportTop || elementBottom > viewportBottom) {
          window.scrollTo({
            top: scrollTop,
            behavior: scrollBehavior
          });
        }
      } catch (error) {
        console.warn('speak2me.core: Could not scroll to highlighted element:', error);
      }
      return true;
    }
    return false;
  }

  // Claude: paragraph highlighting fixes - clear all highlights
  function clearAllHighlights() {
    $('.tts-karaoke-highlight-paragraph').removeClass('tts-karaoke-highlight-paragraph');
  }

  function removeParagrapHighlight(dataId) {
    const selector = `[data-speak2me-id="${dataId}"]`;
    const $element = document.querySelector(selector);

    if ($element !== null && $element !== undefined) {
      console.debug(`speak2me.core: removeParagrapHighlight called on id: ${dataId}`);
      $element.classList.remove('tts-karaoke-highlight-paragraph');
    }

  }

  // OPTIMIZATION: improved scan function with better error handling
  function scanPage(options) {
    var line = options.startLine || 0;
    var lines;
    var scanCounter = 0;
    var maxScanIterations = 100; // STABILITY: Prevent infinite loops

    function scanSection() {
      // STABILITY: add maximum iteration check
      if (scanCounter++ > maxScanIterations) {
        console.warn('speak2me.core: Page scan exceeded maximum iterations');
        finalizeScan();
        return;
      }

      // OPTIMIZATION: calculate once per iteration
      lines = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      // OPTIMIZATION: cache jQuery selector
      var $contentEl = getCachedContent();
      $contentEl.css('opacity', '0.3');

      if (line < lines) {
        setTimeout(function() {
          line = line + pageScanLines;
          window.scrollTo({top: line, behavior: 'smooth'});
          scanSection();
        }, pageScanCycle);
      } else {
        setTimeout(finalizeScan, pageScanCycle);
      }
    }

    function finalizeScan() {
      scanFinished = true;
      getCachedContent().css('opacity', '1');
      
      // Claude: paragraph highlighting fixes - Assign IDs and build cache
      paragraphIdCounter = 0;
      getCachedContent().find('p, h1, h2, h3, h4, h5, h6').each(function() {
        var $elem = $(this);
        if (!$elem.attr('data-speak2me-id')) {
          $elem.attr('data-speak2me-id', 'speak2me-p-' + (paragraphIdCounter++));
        }
      });
    }

    scanSection();
  }

  // merge (configuration) objects
  // OPTIMIZATION: simplified and more efficient
  function extend() {
    var target = {};
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i];
      if (source) { // STABILITY: Check for null/undefined
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  }

  // get the content of a Cookie (by its name)
  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return undefined;
  }

  function voiceTag(prepend, append) {
    this.prepend = prepend;
    this.append = append;
  }

  function voiceObj(name, language) {
    this.name = name;
    this.language = language;
  }

  // count the number of words in a string
  // OPTIMIZATION: more efficient word counting
  function wordCount(str) {
    if (!str || typeof str !== 'string') return 0; // STABILITY: Input validation
    var words = str.trim().split(/\s+/);
    return words.filter(word => word !== '').length;
  }

  // this populates the "voices" array with objects that represent the
  // available voices in the current browser.
  // populateVoiceList seems NOT reqired
  //
  function populateVoiceList() {
    // OPTIMIZATION: clear existing voices before re-populating
    voices = [];
    
    let systemVoicesText = 'systemVoices START - ';
    var systemVoices = speechSynthesis.getVoices();

    for (var i = 0; i < systemVoices.length; i++) {
      voices.push(new voiceObj(systemVoices[i].name, systemVoices[i].lang));
      
      // OPTIMIZATION: use regex for language matching
      if (/^(en|de-DE|es-ES|pl|nl)/.test(systemVoices[i].lang)) {
        systemVoicesText += systemVoices[i].lang.toString();
        systemVoicesText += ' : ';
        systemVoicesText += systemVoices[i].name.toString();
        systemVoicesText += '\n';
      }
    }
    systemVoicesText += " - systemVoices END.";
  }

  // populateVoiceList seems NOT reqired
  populateVoiceList();

   // populateVoiceList seems NOT reqired
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  // after checking for compatibility, define the utterance object
  if ('speechSynthesis' in window) {
    var speech = new SpeechSynthesisUtterance();
    window.speechSynthesis.cancel();
  }

  // OPTIMIZATION: simplified language detection
  if (!currentTranslation) {
    currentLanguage = defaultLanguage;
  } else {
    var translation = currentTranslation.split('/');
    var langCode = translation[2];
    
    // OPTIMIZATION: use object mapping for language codes
    var languageMap = {
      'en': 'en-GB',
      'ar': 'ar-EG',
      'cs': 'cs-CZ',
      'da': 'da-DK',
      'et': 'et-EE',
      'ka': 'ka-GE',
      'el': 'el-GR',
      'iw': 'he-IL',
      'hi': 'hi-IN',
      'ja': 'ja-JP',
      'zh': 'zh-CN'
    };
    
    currentLanguage = languageMap[langCode] || (langCode + '-' + langCode.toUpperCase());
  }

  if (isChrome) {
    voiceLanguageDefault = voiceLanguageGoogleDefault[currentLanguage];
  } else if (isEdge) {
    voiceLanguageDefault = voiceLanguageMicrosoftDefault[currentLanguage];
  } else if (isFirefox) {
    voiceLanguageDefault = voiceLanguageFirefoxDefault[currentLanguage];
  }

  // ---------------------------------------------------------------------------
  // public functions (methods)
  // ---------------------------------------------------------------------------
  var methods = {

    // main speak2me method
    speak: function(options) {
      var toSpeak   = '';
      var voiceTags = {};
      var _this     = this;
      var obj, processed, finished;
      var ignoreTags;

      scanFinished  = false;
      myOptions     = extend(options, defaultOptions, customOptions || {});

      // STABILITY: validate options
      if (!myOptions) {
        console.error('speak2me.core: Invalid options provided');
        return this;
      }

      // scan page to find correct positions for scrolling and highlighting
      if (!myOptions.isPaused) {
        scanPage({ startLine: 0 });
      } else {
        scanFinished = true;
        // Claude: paragraph highlighting fixes - Also build cache when resuming
        paragraphIdCounter = 0;
        getCachedContent().find('p, h1, h2, h3, h4, h5, h6').each(function() {
          var $elem = $(this);
          if (!$elem.attr('data-speak2me-id')) {
            $elem.attr('data-speak2me-id', 'speak2me-p-' + (paragraphIdCounter++));
          }
        });

        // build the paragraph cache for fast lookups (NOT used)
        // buildParagraphCache();
      }

      // values of voice tags for pre- and post-pending spoken text
      //
      voiceTags['a']                    = new voiceTag('Link' + '.', '');
      voiceTags['img']                  = new voiceTag('Image element' +  '.', 'Element not spoken' +  '.');
      voiceTags['table']                = new voiceTag('Table element' +  '.', 'Element not spoken' +  '.');
      voiceTags['card-header']          = new voiceTag('', '');
      voiceTags['.doc-example']         = new voiceTag('Example element' + '.', 'Element not spoken' + '.');
      voiceTags['.admonitionblock']     = new voiceTag('Attention element ' +  '.', '');
      voiceTags['.listingblock']        = new voiceTag('Text element' +  '.', 'Element not spoken' + '.');
      voiceTags['.gist']                = new voiceTag('Gist element' +  '.', 'Element not spoken' + '.');
      voiceTags['.slider']              = new voiceTag('Slider element' +  '.', 'Element not spoken' + '.');
      voiceTags['.swiper-app']          = new voiceTag('Slider element' +  '.', 'Element not spoken' + '.');
      voiceTags['.modal']               = new voiceTag('Info element' +  '.', 'Element not spoken' + '.');
      voiceTags['.masonry']             = new voiceTag('Masonry element' +  '.', 'Element not spoken' + '.');
      voiceTags['.lightbox-block']      = new voiceTag('Lightbox element' +  '.', 'Element not spoken' + '.');
      voiceTags['.gallery']             = new voiceTag('Gallery element' +  '.', 'Element not spoken' + '.');
      voiceTags['.audioblock']          = new voiceTag('Audio element' +  '.', 'Element not spoken' + '.');
      voiceTags['.videoblock']          = new voiceTag('Video element' +  '.', 'Element not spoken' + '.');
      voiceTags['.videojs-player']      = new voiceTag('Video element' +  '.', 'Element not spoken' + '.');
      voiceTags['.youtube-player']      = new voiceTag('Video element' +  '.', 'Element not spoken' + '.');
      voiceTags['.dailymotion-player']  = new voiceTag('Video element' +  '.', 'Element not spoken' + '.');
      voiceTags['.vimeo-player']        = new voiceTag('Video element' +  '.', 'Element not spoken' + '.');
      voiceTags['.wistia-player']       = new voiceTag('Video element' +  '.', 'Element not spoken' + '.');
      voiceTags['figure']               = new voiceTag('Figure element' +  '.', 'Element not spoken' + '.');    
      voiceTags['parallax-quoteblock']  = new voiceTag('Parallax Quoteblock' + '.', '');
      voiceTags['blockquote']           = new voiceTag('Blockquote' + '.',  '');
      voiceTags['quoteblock']           = new voiceTag('Quoteblock' + '.',  '');

      // HTML tags NOT spoken (ignored)
      ignoreTags = [
        'audio',
        'button',
        'canvas',
        'code',
        'del', 
        'pre', 
        'dialog',
        'embed',
        'form',
        'head',
        'iframe',
        'meter',
        'nav',
        'noscript',
        'object',
        'picture', 
        'script',
        'select',
        'style',
        'textarea',
        'video'
      ];

      // STABILITY: check if speech synthesis is already active
      if (window.speechSynthesis.speaking) {
        console.warn('speak2me.core: Speech synthesis already in progress');
        return this;
      }

      // top-level function to prepare the HTML content
      var processSpeech = setInterval(function () {
        if (scanFinished) {
          // OPTIMIZATION: process all elements in one pass
          try {
            _this.each(function() {
              obj = $(this).clone();
              processed = processDOMelements(obj, voiceTags, ignoreTags);
              processed = $(processed).html();
              finished = cleanDOMelements(processed);
              toSpeak = finished;
            });
          } catch (error) {
            // STABILITY: error handling for DOM processing
            console.error('speak2me.core: Error processing DOM elements', error);
            clearInterval(processSpeech);
            return;
          }

          // set speech parameters
          rate    = rateUserDefault !== undefined ? rateUserDefault : rateDefault;
          pitch   = pitchUserDefault !== undefined ? pitchUserDefault : pitchDefault;
          volume  = volumeUserDefault !== undefined ? volumeUserDefault : volumeDefault;

          // OPTIMIZATION: remove old event listeners before adding new ones
          // ...
          // if (speech && activeEventListeners.onstart) {
          //   speech.removeEventListener('onstart', activeEventListeners.onstart);
          //   speech.removeEventListener('onend', activeEventListeners.onend);
          //   if (activeEventListeners.onboundary) {
          //     speech.removeEventListener('onboundary', activeEventListeners.onboundary);
          //   }
          // }

          // create and configure the utterance object
          speech          = new SpeechSynthesisUtterance();
          speech.rate     = rate;
          speech.pitch    = pitch;
          speech.volume   = volume;

          // STABILITY: safe voice selection with fallback
          var availableVoices = speechSynthesis.getVoices();
          var selectedVoice   = availableVoices.find(function(voice) {
            return voice.name === voiceLanguageDefault;
          });

          speech.voice = selectedVoice || availableVoices[0];
          speech.previousScrollPosition = 0;

          // SYNC FIX 13b: Updated onboundary with timing compensation
          activeEventListeners.onboundary = (event) => {
            if (event.name === 'word') {
              const startIndex  = event.charIndex;
              const length      = event.charLength;
              const targetText  = event.target.text;

              // extract|log current word from original text
             const currentWord = targetText.substring(startIndex, startIndex + length);
             console.debug(`speak2me.core, utterance.onboundary: spoken word: '${currentWord}' at startIndex: ${startIndex}`);

              // SYNC FIX 13b: highlightWord now includes browser-specific timing compensation
              highlightWord(startIndex);
            }
          };

          activeEventListeners.onstart = (event) => {
            const speak2meId            = event.currentTarget.speak2meId;
            const selector              = `[data-speak2me-id="${speak2meId}"]`;
            const $element              = document.querySelector(selector);            
            const $paragraph            = event.currentTarget.$paragraph;
            const isAlredadyHighlighted = (speak2meId === currentHighlightedElement) ? true : false;
             
            if (!isAlredadyHighlighted) {

              if ($paragraph !== undefined && $paragraph !== null) {
                // remove highlight on current paragraph
                console.debug(`speak2me.core, onstart: remove highlight on: ${currentHighlightedElement}`);
                removeParagrapHighlight(currentHighlightedElement);
              } else {
                // failsafe: manage loose text (NO speak2meId found on paragraph)
                console.warn('speak2me.core, onstart: error accessing loose text');

                // clear all highlights globally
                $('.tts-karaoke-highlight-paragraph').removeClass('tts-karaoke-highlight-paragraph');
                console.warn('speak2me.core, onstart: clear all highlights globally');
              }

              if (speak2meId !== undefined) {
                console.debug(`speak2me.core, onstart: set highlight on: ${speak2meId}`);
                setHighlightParagraph(speak2meId);                  
              } else {
                console.warn(`speak2me.core, onstart: could not set highlight on paragraph`);
              }
         
              // highlightning words supported only on paragraphs
              if ($element !== null && $element.localName === 'p') {
                prepareParagraphToHighlighWords($element.innerText);
              }

            } else {
              console.debug(`speak2me.core, onstart: highlight MOT changed on: ${speak2meId}`);
            }
          };

          activeEventListeners.onend = (event) => {
            const speak2meId            = event.currentTarget.speak2meId;
            var selector                = `[data-speak2me-id="${speak2meId}"]`;
            const $element              = document.querySelector(selector) || null;
            const isHighlighted         = $element?.classList.contains('tts-karaoke-highlight-paragraph');
            const isAlredadyHighlighted = (speak2meId === currentHighlightedElement) ? true : false;
            var currentTargetText       = event.currentTarget.text;

            // reset word-highlightning (spans) by overwriting the HTML content
            if (previousParagraph !== null) {
              previousParagraph.innerHTML  = previousParagraphHTML;
            }

            // clear element id for word-based highlightning
            if ($element !== null && $element.id === 'speak_highlighted') {
              $element.removeAttribute('id');
            }

            // pause between sentences in a paragraph
            pauseOnSpeak(pauseBetweenSentences);
          };

          speech.onstart    = activeEventListeners.onstart;
          speech.onend      = activeEventListeners.onend;
          speech.onboundary = activeEventListeners.onboundary;

          processTextChunks(speech, toSpeak);
          clearInterval(processSpeech);
        }
      }, speechCycle);

      // create the chunks array from (speakable) text generated
      function splitTextIntoChunks(text) {
        var chunks = [];

        // OPTIMIZATION: chain text cleanup operations
        text = text
          .replace(/^\s+>/gm, '')
          .replaceAll('..', '.')
          .replace(/(\r\n|\n|\r)/gm, '')
          .replace(/\s+/gm, ' ');

        chunks = text.split('.');

        // OPTIMIZATION: single pass cleanup with filter
        chunks = chunks
          .map(chunk => chunk.replace(/^\s+/g, '').replaceAll('""', ''))
          .filter(chunk => chunk.length > 0)
          .map(chunk => chunk + '. ');

        // build the chunk OBJECT array
        var chunkSet = [];
        var $contentCached = getCachedContent();

        chunks.forEach((chunk, index) => {
          var text = chunks[index];
          var sectionText = textSlice(text, textSliceLength, minWords);
          var offset;
          var $paragraph;
          var speak2meId;

          if (sectionText) {
            // Claude: paragraph highlighting fixes - Enhanced paragraph matching
            $paragraph = findParagraphByText(sectionText, $contentCached);
            
            // store comprehensive data for reliable lookup later
            if ($paragraph && $paragraph.length > 0) {
              offset = Math.round($paragraph.offset().top);
              speak2meId = $paragraph.attr('data-speak2me-id');
              
              // Claude: paragraph highlighting fixes - Ensure ID exists
              if (!speak2meId) {
                speak2meId = 'speak2me-p-' + (paragraphIdCounter++);
                $paragraph.attr('data-speak2me-id', speak2meId);
                
                // update cache with new ID
                paragraphCache.set(speak2meId, {
                  element: $paragraph,
                  normalizedText: normalizeText($paragraph.text()),
                  offsetTop: offset
                });
              }
            }
          }

          chunkSet.push({
            text: text,
            offsetTop: offset,
            $paragraph: $paragraph,
            speak2meId: speak2meId,
            sectionText: sectionText
          });
        });

        // create the headings array
        headingsArray = parseContent.selectHeadings (
          defaultOptions.contentSelector,
          defaultOptions.headingSelector
        );

        // OPTIMIZATION: more efficient heading parsing
        if (headingsArray && headingsArray.length > 0) {
          chunkSet.forEach((chunk) => {
            if (chunk.offsetTop === undefined) {
              var cleanText = chunk.text.replace(/[.?!]/g, '').trim();
              var normalizedChunkText = normalizeText(cleanText);

              for (var node of headingsArray) {
                var innerText = node.innerText.replace(/[?!]/g, '') + '.';
                var normalizedNodeText = normalizeText(innerText);
                
                // Claude: paragraph highlighting fixes - Better heading text comparison
                if (normalizedNodeText === normalizedChunkText || 
                    normalizedNodeText.indexOf(normalizedChunkText) !== -1 ||
                    normalizedChunkText.indexOf(normalizedNodeText) !== -1) {
                  var headline = $('#' + node.id);
                  if (headline.length > 0) {
                    chunk.offsetTop = Math.round(headline.offset().top);
                    chunk.speak2meId = headline.attr('data-speak2me-id');
                    
                    // Claude: paragraph highlighting fixes - Ensure heading has ID
                    if (!chunk.speak2meId) {
                      chunk.speak2meId = 'speak2me-p-' + (paragraphIdCounter++);
                      headline.attr('data-speak2me-id', chunk.speak2meId);
                      
                      // update cache
                      paragraphCache.set(chunk.speak2meId, {
                        element: headline,
                        normalizedText: normalizedNodeText,
                        offsetTop: chunk.offsetTop
                      });
                    }
                    
                    // Claude: paragraph highlighting fixes - Update paragraph reference
                    chunk.$paragraph = headline;
                  }
                  break;
                }
              }
            }
          });
        }

        return chunkSet;
      }

      // create a slice of text
      function textSlice(text, sliceLength, wordsMin) {
        if (!text || typeof text !== 'string') return undefined; // STABILITY: Validation

        var startSubString = 0;
        var endSubString = startSubString + sliceLength;
        var subText = text.substr(startSubString, endSubString);
        var stringArray = subText.split(/(\s+)/);

        // remove last two elements (fraction of subText)
        stringArray.pop();
        stringArray.pop();

        subText = stringArray.join('').replaceAll('.', '');

        var words = wordCount(subText);
        if (words < wordsMin) {
          return undefined;
        }
        return subText;
      }

      // process chunks (sentences to speak) sequentially
      function processTextChunks(speaker, chunks) {
        const synth = window.speechSynthesis;

        // indicate active converter in the quicklinks bar
        $('.mdib-speaker').addClass('mdib-spin');

        // Claude: paragraph highlighting fixes - Enhanced start event handler
        activeEventListeners.start = function(event) {
          // clear any existing highlights
          // clearAllHighlights();

          // handle scrolling for valid offsetTop positions
          if (speaker.offsetTop !== undefined) {
            // Skip scrolling if offsetTop position is LOWER than expected
            if (speaker.offsetTop >= speaker.previousScrollPosition) {
              window.scrollTo({
                top: speaker.offsetTop - scrollBlockOffset,
                behavior: scrollBehavior
              });
            }
          }
        };

        // Claude: paragraph highlighting fixes - Enhanced end event handler
        activeEventListeners.end = function(event) {
          // workaround to detect offsetTop positions LOWER than expected
          if (speaker.offsetTop !== undefined) {
            if (speaker.offsetTop >= speaker.previousScrollPosition) {
              speaker.previousScrollPosition = speaker.offsetTop;
            }
            lastScrollPosition = speaker.offsetTop - scrollBlockOffset;
          }

          // Remove highlighting for the paragraph already spoken
          if (speaker.$currentHighlight !== undefined) {
            speaker.$currentHighlight.removeClass('tts-karaoke-highlight-paragraph');
            speaker.$currentHighlight = undefined;
          }

          chunkSpoken = false;
          chunkCounter++;
        };

        speaker.addEventListener('start', activeEventListeners.start);
        speaker.addEventListener('end', activeEventListeners.end);

        // loop to prepare ALL chunks to speak or STOP the voice output
        var wasRunOnce = false;
        var speechMonitor = setInterval(function () {
          // check if all chunks (text) are spoken
          if (chunkCounter >= chunkCounterMax || userStoppedSpeaking) {
            chunkCounter = 0;
            userStoppedSpeaking = false;
            chunkSpoken = false;

            if (speaker.$paragraph !== undefined) {
              speaker.$paragraph.removeClass('tts-karaoke-highlight-paragraph');
            }

            // remove speak indication
            $('.mdib-speaker').removeClass('mdib-spin');

            // OPTIMIZATION: Clean up event listeners when done
            if (speaker && activeEventListeners.start) {
              speaker.removeEventListener('start', activeEventListeners.start);
              speaker.removeEventListener('end', activeEventListeners.end);

              activeEventListeners = { start: null, end: null };
            }

            clearInterval(speechMonitor);
          } else {
            if (!wasRunOnce && myOptions.isPaused) {
              chunkCounter = myOptions.lastChunk || 0; // STABILITY: Add fallback
              wasRunOnce = true;
            }

            // STABILITY: Validate chunk exists before accessing
            if (chunks[chunkCounter]) {
              speaker.text          = chunks[chunkCounter].text;
              speaker.offsetTop     = chunks[chunkCounter].offsetTop;
              speaker.$paragraph    = chunks[chunkCounter].$paragraph;
              speaker.speak2meId    = chunks[chunkCounter].speak2meId;
              speaker.sectionText   = chunks[chunkCounter].sectionText;

              // speak current text line
              if (!chunkSpoken && synth) {
                synth.speak(speaker);
                chunkSpoken = true;
              }
            } else {
              console.warn('speak2me.core: Invalid chunk at index', chunkCounter);
              clearInterval(speechMonitor);
            }
          }
        }, speechMonitorCycle);
      }

      // transform all configured DOM elements of a page
      function processDOMelements(clone, voiceTags, ignoreTags) {
        var copy, title, title_element, content_type, content_element, content, appended, prepend;

        // STABILITY: Validate clone exists
        if (!clone || !clone.length) {
          console.error('speak2me.core: Invalid DOM clone');
          return clone;
        }

        // OPTIMIZATION: batch similar operations
        ignoreTags.forEach(function(tag) {
          clone.find(tag).addBack(tag).remove();
        });

        if (ignoreTagsUser.length > 0) {
          ignoreTagsUser.forEach(function(tag) {
            clone.find(tag).addBack(tag).remove();
          });
        }

        if (recognizeTagsUser.length > 0) {
          clone = clone.find(recognizeTagsUser.join(', '));
        }

        // Process <figure> tags
        clone.find('figure').addBack('figure').each(function() {
          copy = $(this).find('figcaption')[0]?.innerText;
          prepend = customTags['figure'] ? customTags['figure'].prepend : voiceTags['figure'].prepend;
          appended = customTags['figure'] ? customTags['figure'].append : voiceTags['figure'].append;

          if (copy !== undefined && copy !== '') {
            $('<div>' + prepend + pause_spoken + copy + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Process <image> tags
        clone.find('img').addBack('img').each(function() {
          copy = $(this).attr('alt');
          var parent = $(this).parent();
          var parentName = parent.get(0).tagName;
          prepend = customTags['img'] ? customTags['img'].prepend : voiceTags['img'].prepend;

          if (copy !== undefined && copy !== '') {
            var insertTarget = parentName === 'PICTURE' ? parent : this;
            $('<div>' + prepend + pause_spoken + copy + pause_spoken + '</div>').insertBefore(insertTarget);
          }
          $(this).remove();
        });

        // Process <a> tags
        clone.find('a').addBack('a').each(function() {
          var anchor = $(this);
          copy = anchor[0].innerText;
          prepend = voiceTags['a'].prepend;
          appended = voiceTags['a'].append;

          $('<div>' + copy + '</div>').insertBefore(this);
          $('<div>' + appended + '</div>').insertBefore(this);
          $(this).remove();
        });

        // OPTIMIZATION: Helper function to process blocks with similar structure
        function processBlock(selector, voiceTag, getContent) {
          clone.find(selector).addBack(selector).each(function() {
            var result = getContent($(this));
            prepend = customTags[selector] ? customTags[selector].prepend : voiceTags[voiceTag].prepend;
            appended = customTags[selector] ? customTags[selector].append : voiceTags[voiceTag].append;

            if (result && result.content) {
              $('<div>' + prepend + result.prefix + result.content + '</div>').insertBefore(this);
              $('<div>' + appended + '</div>').insertBefore(this);
            } else {
              $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
              $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
            }
            $(this).remove();
          });
        }

        // Process admonition blocks
        processBlock('.admonitionblock', '.admonitionblock', function($el) {
          var content_type = $el[0].classList[1];
          var content = $el.find('.content')[0]?.innerText;
          return content ? { content: content, prefix: content_type + '. ' } : null;
        });

        // Process parallax quote blocks
        processBlock('.parallax-quoteblock', 'quoteblock', function($el) {
          var content = $el.find('.quote-text')[0]?.innerText;
          return content ? { content: content + pause_spoken, prefix: pause_spoken } : null;
        });

        // Process quote blocks
        clone.find('.quoteblock').addBack('.quoteblock').each(function() {
          var attribution = $(this).find('.attribution');
          content_element = $(this).find('blockquote');
          content = content_element[0]?.innerText + (attribution[0]?.innerText || '');
          prepend = voiceTags['quoteblock'].prepend;
          appended = voiceTags['quoteblock'].append;

          if (content !== undefined && content !== '') {
            $('<div>' + prepend + pause_spoken + content + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Process tables
        clone.find('table').addBack('table').each(function() {
          copy = $(this).find('caption').text();
          prepend = voiceTags['table'].prepend;
          appended = voiceTags['table'].append;

          if (copy !== undefined && copy !== '') {
            $('<div>' + prepend + pause_spoken + copy + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // OPTIMIZATION: Helper for media blocks (audio/video players)
        function processMediaBlock(selector, voiceTag) {
          clone.find(selector).addBack(selector).each(function() {
            var titleText = $(this).find('.title, .video-title').text();
            prepend = voiceTags[voiceTag].prepend;
            appended = voiceTags[voiceTag].append;

            if (titleText !== undefined && titleText !== '') {
              $('<div>' + prepend + 'with the title, ' + titleText + pause_spoken + '</div>').insertBefore(this);
              $('<div>' + appended + '</div>').insertBefore(this);
            } else {
              $('<div>' + prepend + '</div>').insertBefore(this);
              $('<div>' + appended + '</div>').insertBefore(this);
            }
            $(this).remove();
          });
        }

        // Process all media blocks
        processMediaBlock('.audioblock', '.audioblock');
        processMediaBlock('.videoblock', '.videoblock');
        processMediaBlock('.videojs-player', '.videojs-player');
        processMediaBlock('.youtube-player', '.youtube-player');
        processMediaBlock('.dailymotion-player', '.dailymotion-player');
        processMediaBlock('.vimeo-player', '.vimeo-player');
        processMediaBlock('.wistia-player', '.wistia-player');

        // Process card headers
        clone.find('.card-header').addBack('card-header').each(function() {
          title_element = $(this).find('.card-title');
          prepend = voiceTags['card-header'].prepend;
          appended = voiceTags['card-header'].append;

          title = title_element.length ? title_element[0].innerText + pause_spoken : '';

          $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + pause_spoken + title + '</div>').insertBefore(this);
          title_element.remove();
        });

        // Process doc-example elements
        clone.find('.doc-example').addBack('.doc-example').each(function() {
          prepend = voiceTags['.doc-example'].prepend;
          appended = voiceTags['.doc-example'].append;

          $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          $(this).remove();
        });

        // Process listing blocks
        clone.find('.listingblock').addBack('.listingblock').each(function() {
          title_element = $(this).find('.title');
          copy = title_element.length ? title_element[0].innerText : '';
          prepend = voiceTags['.listingblock'].prepend;
          appended = voiceTags['.listingblock'].append;

          if (copy !== undefined && copy !== '') {
            $('<div>' + prepend + ' with the title,' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // OPTIMIZATION: Helper for elements with title in previous sibling
        function processTitledBlock(selector, voiceTag) {
          clone.find(selector).addBack(selector).each(function() {
            var prev = $(this).prev()[0];
            title = (prev !== undefined) ? prev.innerText : '';
            title = title.trim();
            title += '.'; // add a dot for a pause spoken

            title_element = prev !== undefined ? $(this).prev() : null;
            if (title_element) title_element.remove();

            prepend = voiceTags[voiceTag].prepend;
            appended = voiceTags[voiceTag].append;

            if (title !== undefined && title !== '') {
              if (prepend !== '') $('<div>' + prepend + ' with the title, ' + title +  '.' + '</div>').insertBefore(this);
              if (appended !== '') $('<div>' + appended + '</div>').insertBefore(this);
            } else {
              if (prepend !== '') $('<div>' + prepend +  '.' + '</div>').insertBefore(this);
              if (appended !== '') $('<div>' + appended +  '.' + '</div>').insertBefore(this);
            }
            $(this).remove();
          });
        }

        // Process various titled blocks
        processTitledBlock('.gist', '.gist');
        processTitledBlock('.masonry', '.masonry');
        processTitledBlock('.slider', '.slider');
        processTitledBlock('.gallery', '.gallery');
        processTitledBlock('.swiper-app', '.swiper-app');
        processTitledBlock('.lightbox-block', '.lightbox-block');

        // Remove modal elements
        clone.find('.modal').addBack('.modal').remove();

        // Process data-speak2me-swap
        clone.find('[data-speak2me-swap]').addBack('[data-speak2me-swap]').each(function() {
          copy = $(this).data('speak2me-swap');
          $(this).text(copy);
        });

        return clone;
      }

      // clean DOM elements (sanitize)
      function cleanDOMelements(text) {
        if (!text || typeof text !== 'string') return ''; // STABILITY: Validation

        // OPTIMIZATION: chain multiple replace operations
        return text
          .replace(/<br>/gi, ' ')
          .replace(/<br \/>/gi, ' ')
          .replace(/<.*?>/gi, ' ')
          .replace(/\s+/gi, ' ')
          .replace(/\&nbsp;/gi, ' ')
          .replace(/&/gi, ' and ')
          .replace(/</gi, ' less than ')
          .replace(/>/gi, ' greater than ')
          .replace(/ +/gi, ' ');
      }

      return this;
    },

    pause: function() {
      var synth = window.speechSynthesis;
      if (synth && synth.speaking && !synth.paused) {
        synth.pause();
      }
      return this;
    },

    resume: function() {
      var synth = window.speechSynthesis;
      if (synth && synth.paused) {
        synth.resume();
      }
      return this;
    },

    stop: function() {
      userStoppedSpeaking = true;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();

        // OPTIMIZATION: clean up event listeners when stopping
        if (speech && activeEventListeners.start) {
          speech.removeEventListener('start', activeEventListeners.start);
          speech.removeEventListener('end', activeEventListeners.end);
        }

        // Claude: paragraph highlighting fixes - Use centralized clearing
        clearAllHighlights();
      }

      return this;
    },

    enabled: function() {
      return ('speechSynthesis' in window);
    },

    isSpeaking: function() {
      return window.speechSynthesis ? window.speechSynthesis.speaking : false;
    },

    isSpoken: function() {
      return (window.speechSynthesis && window.speechSynthesis.speaking) ? chunkCounter : false;
    },

    isScrolled: function() {
      return (window.speechSynthesis && window.speechSynthesis.speaking) ? lastScrollPosition : false;
    },

    isPaused: function() {
      return window.speechSynthesis ? window.speechSynthesis.paused : false;
    },

    rate: function() {
      var num = arguments[0];
      if (num >= 0.1 && num <= 10) {
        rateUserDefault = num;
      } else if (num === undefined) {
        rateUserDefault = undefined;
        rate = rateDefault;
      }

      return this;
    },

    pitch: function() {
      var num = arguments[0];
      if (num >= 0.1 && num <= 2) {
        pitchUserDefault = num;
      } else if (num === undefined) {
        pitchUserDefault = undefined;
        pitch = pitchDefault;
      }

      return this;
    },

    volume: function() {
      var num = arguments[0];
      if (num >= 0 && num <= 1) {
        volumeUserDefault = num;
      } else if (num === undefined) {
        volumeUserDefault = undefined;
        volume = volumeDefault;
      }

      return this;
    },

    ignore: function() {
      var len = arguments.length;
      ignoreTagsUser = []; // OPTIMIZATION: Direct assignment instead of setting length
      for (var i = len - 1; i >= 0; i--) {
        ignoreTagsUser.push(arguments[i]);
      }

      return this;
    },

    recognize: function() {
      var len = arguments.length;
      recognizeTagsUser = [];
      for (var i = len - 1; i >= 0; i--) {
        recognizeTagsUser.push(arguments[i]);
      }

      return this;
    },

    replace: function() {
      var len = arguments.length;
      replacements = [];
      for (var i = 0; i < len - 1; i += 2) {
        replacements.push(arguments[i], arguments[i + 1]);
      }

      return this;
    },

    customize: function() {
      var len = arguments.length;

      if (len === 0) {
        customTags = [];
        return this;
      }

      if (len === 2) {
        if (['img','table','figure'].indexOf(arguments[0]) === -1) {
          console.warn("speak2me.core: When customizing, tag must be 'img', 'table', or 'figure'.");
          return this;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString());
      }

      if (len === 3) {
        if (['q','ol','ul','blockquote'].indexOf(arguments[0]) === -1) {
          console.warn("speak2me.core: When customizing, tag must be 'q', 'ol', 'ul' or 'blockquote'.");
          return this;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString(), arguments[2].toString());
      }

      return this;
    },

    getVoices: function() {
      const voices        = speechSynthesis.getVoices();

      const germanVoices  = voices.filter(v => v.lang.startsWith('de'));
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      const otherVoices   = voices.filter(v => !v.lang.startsWith('de') && !v.lang.startsWith('en'));

      // Return voice array if no arguments
      if (arguments.length === 0) {
        return voices;
      }

      // Create dropdown menu
      var obj = $(arguments[0]);
      var selectionTxt = arguments[1] !== undefined ? arguments[1] : 'Choose a voice';

      obj.append($("<select id='voiceSelect' name='voiceSelect'><option value='none'>" + selectionTxt + "</option></select>"));

      var skippedVoices = 0;
      
      // OPTIMIZATION: Use filter and forEach for cleaner code
      voices.forEach(function(voice, i) {
        // Skip unwanted voices
        if ((isChrome && voice.name.includes(ignoreProvider)) ||
            (isEdge && !voice.name.includes('Natural'))) {
          skippedVoices++;
          return;
        }

        var option = document.createElement('option');
        // does NOT work
        // option.textContent = voice.name + ' (' + voice.language + ')';
        option.textContent = voice.name;
        option.setAttribute('value', voice.name);

        // Set selected voice
        if (voiceLanguageDefault !== undefined && voice.name === voiceLanguageDefault) {
          option.setAttribute('selected', 'selected');
        }

        // does NOT work
        // option.setAttribute('data-speak2me-language', voice.language);

        obj.find('select').append(option);
      });

      return voices.length - skippedVoices;
    },

    setVoice: function() {
      if (arguments.length < 2) {
        return this;
      }

      var requestedVoice, requestedLanguage;

      if (arguments[0] === 'name') {
        requestedVoice = arguments[1];
        // OPTIMIZATION: Use find instead of loop
        var foundVoice = voices.find(function(voice) {
          return voice.name === requestedVoice;
        });
        if (foundVoice) {
          voiceUserDefault = requestedVoice;
        }
      }

      if (arguments[0] === 'language') {
        requestedLanguage = arguments[1].toUpperCase();

        var foundVoice;
        if (requestedLanguage.length === 2) {
          // Find by first two characters
          foundVoice = voices.find(function(voice) {
            return voice.language.substring(0, 2).toUpperCase() === requestedLanguage;
          });
        } else {
          // Find by complete language code
          foundVoice = voices.find(function(voice) {
            return voice.language === requestedLanguage;
          });
        }

        if (foundVoice) {
          voiceUserDefault = foundVoice.name;
        }
      }

      return this;
    }
  }; // END methods

  // main speak2me method
  $.fn.speak2me = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.speak.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.speak2me');
    }
  };

}($));
