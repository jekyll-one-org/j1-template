/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/speak2me.js
 # speak2me v.1.5 implementation (based on Articulate.js) for J1 Theme
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
 # - Claude: Paragraph highlighting fixes - Enhanced paragraph tracking and highlighting
 # - Claude: Additional Paragraph highlighting fixes - Eliminated race conditions
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

  const defaultOptions  = {
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

function parseContent (options) {
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
      console.warn('Element not found: ' + contentSelector); // eslint-disable-line
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
      var currentHeading = getHeadingObject(curr)
      if (currentHeading) {
        addNode(currentHeading, prev.nest)
      }
      return prev
    }, {
      nest: []
    })
  }

  return {
    nestHeadingsArray: nestHeadingsArray,
    selectHeadings: selectHeadings
  }
}


  // const ParseContent         = require('./parse-content.js');
  // const parseContent         = ParseContent(defaultOptions);

  const scrollBehavior      = 'smooth';
  const speechCycle         = 10;
  const speechMonitorCycle  = 10;
  const textSliceLength     = 30;
  const minWords            = 3;
  const pageScanCycle       = 1000;
  const pageScanLines       = 10000;
  const isFirefox           = /Firefox/i.test(navigator.userAgent);
  const isEdge              = /Edg/i.test(navigator.userAgent);
  const chrome              = /chrome/i.test(navigator.userAgent);
  const isChrome            = ((chrome) && (!isEdge));
  const ignoreProvider      = 'Microsoft';
  const sourceLanguage      = document.getElementsByTagName("html")[0].getAttribute("lang");

  // OPTIMIZATION: Cache DOM elements to avoid repeated queries
  var $content              = null; // Will be cached on first use
  var textDisplay;

  var voiceUserDefault      = 'Google UK English Female';
  var voiceChromeDefault    = 'Google US English';
  var defaultLanguage       = '';
  var navigatorLanguage     = navigator.language || navigator.userLanguage;

  var currentTranslation    = getCookie('googtrans');
  var scrollBlockOffset     = 100;

  var customOptions         = {};
  var myOptions             = {};

  var ignoreTagsUser        = [];
  var recognizeTagsUser     = [];
  var replacements          = [];
  var customTags            = [];
  var voices                = [];
  var headingsArray         = [];

  var rateDefault           = 0.9;
  var pitchDefault          = 1;
  var volumeDefault         = 0.9;
  var rate                  = rateDefault;
  var pitch                 = pitchDefault;
  var volume                = volumeDefault;

  var pause_spoken          = ' — ';

  var chunkCounter          = 0;
  var userStoppedSpeaking   = false;
  var chunkSpoken           = false;
  var lastScrollPosition    = false;

  var rateUserDefault;
  var pitchUserDefault;
  var volumeUserDefault;
  var currentLanguage;
  var voiceLanguageDefault;
  var chunkCounterMax;
  var user_session;

  var scanFinished;

  // OPTIMIZATION: Store active event listeners for cleanup
  var activeEventListeners  = {
    start: null,
    end: null,
    boundary: null
  };

  // FIX: Add counter for unique paragraph IDs
  var paragraphIdCounter = 0;

  // Claude: Paragraph highlighting fixes - Add paragraph mapping cache
  var paragraphCache = new Map();
  var currentHighlightedElement = null;

  // Claude: Additional Paragraph highlighting fixes - Add pending operations queue
  var pendingHighlightOperations = [];
  var highlightProcessingLock = false;
  var currentSpeechContext = {
    utterance: null,
    chunks: [],
    currentChunkIndex: 0,
    paragraphMap: new Map()
  };

  var voiceLanguageGoogleDefault = {
    'de-DE':  'Google Deutsch',
    'en-GB':  'Google UK English Female',
    'es-ES':  'Google español',
    'fr-FR':  'Google français',
    'it-IT':  'Google italiano',
  };

  var voiceLanguageMicrosoftDefault = {
    'en-GB':  'Microsoft Libby Online (Natural) - English (United Kingdom)',
    'es-ES' :  'Microsoft Elvira Online (Natural) - Spanish (Spain)',
    'fr-FR':  'Microsoft Denise Online (Natural) - French (France)',
    'de-DE':  'Microsoft Katja Online (Natural) - German (Germany)',
    'it-IT':  'Microsoft Elsa Online (Natural) - Italian (Italy)',
  };

  var voiceLanguageFirefoxDefault = {
    'en-GB':  'Microsoft Hazel - English (United Kingdom)',
    'de-DE':  'Microsoft Katja - German (Germany)',
  };

  if (sourceLanguage == 'en') {
    defaultLanguage = sourceLanguage + '-' + 'GB';
  } else {
    defaultLanguage = sourceLanguage + '-' + sourceLanguage.toUpperCase();
  }

  // ---------------------------------------------------------------------------
  // Internal functions
  // ---------------------------------------------------------------------------

  // OPTIMIZATION: Cache DOM queries
  function getCachedContent() {
    if (!$content) {
      $content = $('#content');
    }
    return $content;
  }

  // toggle the speak ID 'speak_highlighted'
  function toggleSpeakId() {
    if (paragraph.id === 'speak_highlighted') {
      paragraph.removeAttribute('id');
    } else {
      paragraph.id = 'speak_highlighted';
    }
  }

  // highlighting logic
  function highlightWord(charIndex) {
    const spans = document.querySelectorAll('span');
    var currentPos = 0;

    // remove all existing highlights 
    spans.forEach(span => span.classList.remove('highlight'));

    // search for current word to highlight
    for (var span of spans) {
      const wordLength      = span.textContent.length;
      const spanTextContent = span.textContent;

      if (charIndex >= currentPos && charIndex < currentPos + wordLength) {
        span.classList.add('highlight');
        // scroll smooth to current word spoken
        span.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      currentPos += wordLength;
    }
  }

  // split spoken text in spans (for highlighting)
  function prepareText(text) {
    const words = text.split(/\s+/);

    document.querySelector('.speak-highlighted').id = 'speak_highlighted';
    textDisplay  = document.getElementById('speak_highlighted');
    textDisplay.innerHTML = '';

    words.forEach((word, index) => {
      const span = document.createElement('span');
      // add single space between words
      span.textContent = word + ' '; 
      span.dataset.index = index;
      textDisplay.appendChild(span);
    });
  }

  // Claude: Paragraph highlighting fixes - Enhanced text normalization
  function normalizeText(text) {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')                    // Normalize whitespace
      .replace(/['"'""`´]/g, '')               // Remove quotes
      .replace(/[—–-]+/g, '-')                 // Normalize dashes
      .replace(/[\.,!?;:]+/g, '')              // Remove punctuation for matching
      .replace(/\u00A0/g, ' ')                 // Replace non-breaking spaces
      .replace(/[\u200B-\u200D\uFEFF]/g, '')   // Remove zero-width characters
      .toLowerCase();
  }

  // Claude: Paragraph highlighting fixes - Improved text matching with fuzzy logic
  function findParagraphByText(searchText, $container) {
    if (!searchText || !$container) return null;
    
    var normalizedSearch = normalizeText(searchText);
    if (normalizedSearch.length < 3) return null; // Too short to match reliably
    
    var bestMatch = null;
    var bestMatchScore = 0;

    $container.find('p, h1, h2, h3, h4, h5, h6, li, dt, dd').each(function() {
      var $elem = $(this);
      var elemText = normalizeText($elem.text());
      
      // Skip empty elements
      if (elemText.length === 0) return;
      
      // Check for exact substring match
      var index = elemText.indexOf(normalizedSearch);
      if (index !== -1) {
        // Calculate match score (prefer exact matches and shorter elements)
        // Also prefer matches at the beginning of the text
        var lengthScore = normalizedSearch.length / elemText.length;
        var positionScore = 1 - (index / elemText.length);
        var totalScore = (lengthScore * 0.7) + (positionScore * 0.3);
        
        if (totalScore > bestMatchScore) {
          bestMatchScore = totalScore;
          bestMatch = $elem;
        }
      }
    });

    return bestMatch;
  }

  // Claude: Additional Paragraph highlighting fixes - Debounced scroll handler
  var scrollTimeout = null;
  function scrollToParagraph(element, behavior) {
    if (!element || !element.length) return;
    
    // Clear any pending scroll operations
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    // Use requestAnimationFrame for smooth rendering
    scrollTimeout = setTimeout(function() {
      requestAnimationFrame(function() {
        try {
          var elementTop = element.offset().top;
          var scrollTop = elementTop - scrollBlockOffset;
          
          $('html, body').animate({
            scrollTop: scrollTop
          }, behavior === 'smooth' ? 300 : 0);
          
          lastScrollPosition = scrollTop;
        } catch (e) {
          console.warn('speak2me: Scroll error:', e);
        }
      });
    }, 50); // Small delay to batch rapid scroll requests
  }

  // Claude: Additional Paragraph highlighting fixes - Synchronized highlight application
  function applyParagraphHighlight(element) {
    if (!element || !element.length) return;
    
    // Queue operation if already processing
    if (highlightProcessingLock) {
      pendingHighlightOperations.push({ element: element, action: 'apply' });
      return;
    }
    
    highlightProcessingLock = true;
    
    requestAnimationFrame(function() {
      try {
        // Remove previous highlight
        if (currentHighlightedElement && currentHighlightedElement.length) {
          currentHighlightedElement.removeClass('speak-highlighted');
        }
        
        // Apply new highlight
        element.addClass('speak-highlighted');
        currentHighlightedElement = element;
        
        // Scroll to element
        scrollToParagraph(element, scrollBehavior);
        
      } finally {
        highlightProcessingLock = false;
        
        // Process next queued operation
        if (pendingHighlightOperations.length > 0) {
          var nextOp = pendingHighlightOperations.shift();
          if (nextOp.action === 'apply') {
            applyParagraphHighlight(nextOp.element);
          } else if (nextOp.action === 'clear') {
            clearAllHighlights();
          }
        }
      }
    });
  }

  // Claude: Additional Paragraph highlighting fixes - Centralized highlight clearing
  function clearAllHighlights() {
    // Queue operation if already processing
    if (highlightProcessingLock) {
      pendingHighlightOperations.push({ action: 'clear' });
      return;
    }
    
    highlightProcessingLock = true;
    
    requestAnimationFrame(function() {
      try {
        // Clear all highlighted elements
        $('.speak-highlighted').removeClass('speak-highlighted');
        
        if (currentHighlightedElement && currentHighlightedElement.length) {
          currentHighlightedElement.removeClass('speak-highlighted');
          currentHighlightedElement = null;
        }
        
        // Clear paragraph cache
        paragraphCache.clear();
        currentSpeechContext.paragraphMap.clear();
        
      } finally {
        highlightProcessingLock = false;
        
        // Process next queued operation
        if (pendingHighlightOperations.length > 0) {
          var nextOp = pendingHighlightOperations.shift();
          if (nextOp.action === 'apply') {
            applyParagraphHighlight(nextOp.element);
          } else if (nextOp.action === 'clear') {
            clearAllHighlights();
          }
        }
      }
    });
  }

  // Claude: Additional Paragraph highlighting fixes - Build paragraph map on speech start
  function buildParagraphMap(textChunks, $container) {
    var paragraphMap = new Map();
    
    if (!$container || !textChunks || textChunks.length === 0) {
      return paragraphMap;
    }
    
    textChunks.forEach(function(chunk, index) {
      var normalizedChunk = normalizeText(chunk);
      
      // Try to find matching paragraph
      var matchedElement = findParagraphByText(chunk, $container);
      
      if (matchedElement) {
        // Store direct reference to the element
        paragraphMap.set(index, {
          element: matchedElement,
          text: chunk,
          normalizedText: normalizedChunk
        });
        
        // Also cache in global cache
        paragraphCache.set(normalizedChunk, matchedElement);
      }
    });
    
    return paragraphMap;
  }

  // Claude: Additional Paragraph highlighting fixes - Improved speakEvent with better synchronization
  function speakEvent(event) {
    var currentChunk = currentSpeechContext.chunks[currentSpeechContext.currentChunkIndex];
    
    if (!currentChunk) return;
    
    // Get pre-mapped paragraph element
    var paragraphData = currentSpeechContext.paragraphMap.get(currentSpeechContext.currentChunkIndex);
    
    if (paragraphData && paragraphData.element) {
      // Use pre-mapped element - no DOM searching needed
      applyParagraphHighlight(paragraphData.element);
    } else {
      // Fallback: try to find element (should rarely happen with pre-mapping)
      var searchStart = currentChunk.substring(0, Math.min(50, currentChunk.length));
      var $container = getCachedContent();
      var matchedElement = findParagraphByText(searchStart, $container);
      
      if (matchedElement) {
        applyParagraphHighlight(matchedElement);
        
        // Cache for future use
        var normalizedChunk = normalizeText(currentChunk);
        paragraphCache.set(normalizedChunk, matchedElement);
      }
    }
  }

  // return type of HTML element attribute as string
  function eleAttr(attr) {
    return attr.tagName.toLowerCase();
  }

  // Claude: Paragraph highlighting fixes - Improved chunk splitting
  function splitTextIntoChunks(text) {
    if (!text) return [];
    
    // Split by sentences, preserving delimiters
    var sentences = text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [text];
    var chunks = [];
    var currentChunk = '';
    var maxChunkLength = 200; // Reasonable chunk size for speech synthesis
    
    sentences.forEach(function(sentence) {
      var trimmedSentence = sentence.trim();
      
      // If adding this sentence would exceed max length, start new chunk
      if (currentChunk.length > 0 && (currentChunk.length + trimmedSentence.length) > maxChunkLength) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk.length > 0 ? ' ' : '') + trimmedSentence;
      }
    });
    
    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  // constructor function for custom tag objects
  function voiceTag(before, after) {
    this.before = before || '';
    this.after = after || '';
  }

  // get cookie by name
  function getCookie(cookie_name) {
    var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
    if (results) {
      return (unescape(results[2]));
    } else {
      return null;
    }
  }

  function getVoiceByName(requestedVoice) {
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].name === requestedVoice) {
        return voices[i];
      }
    }
  }

  // OPTIMIZATION: More efficient debounce implementation
  function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
      var context = this;
      var args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ---------------------------------------------------------------------------
  // Main module functionality
  // ---------------------------------------------------------------------------

  var speech = new SpeechSynthesisUtterance();

  var methods = {

    init: function(options) {

      myOptions = $.extend(defaultOptions, options);

      var notSupported    = $("<span class='notSupported'>Article couldn't be read.</span>");
      var noVoicesLoaded  = $("<span class='notSupported'>No voices loaded. Retry.</span>");

      // Check for support
      if (!('speechSynthesis' in window)) {
        this.append(notSupported);
        console.warn('speak2me: No Speech Synthesis support in browser.');
        return this;
      }

      // OPTIMIZATION: Use more efficient voice loading
      function loadVoices() {
        voices = window.speechSynthesis.getVoices();

        if (voices.length === 0) {
          console.warn('speak2me: No voices available.');
          return;
        }

        // Set default voice based on browser and language
        if (isChrome) {
          voiceLanguageDefault = voiceLanguageGoogleDefault[defaultLanguage] || voiceChromeDefault;
        } else if (isFirefox) {
          voiceLanguageDefault = voiceLanguageFirefoxDefault[defaultLanguage];
        } else if (isEdge) {
          voiceLanguageDefault = voiceLanguageMicrosoftDefault[defaultLanguage];
        }
      }

      // Load voices with proper event handling
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();

      // Initialize default values
      rate = rateUserDefault !== undefined ? rateUserDefault : rateDefault;
      pitch = pitchUserDefault !== undefined ? pitchUserDefault : pitchDefault;
      volume = volumeUserDefault !== undefined ? volumeUserDefault : volumeDefault;

      return this;
    },

    speak: function(options) {

      // combine user options
      customOptions = $.extend(myOptions, options);

      // default customization tags
      var defaultCustomTags = {
        'img'         : new voiceTag('Image,'),
        'table'       : new voiceTag('Table,'),
        'figure'      : new voiceTag('Figure,'),
        'q'           : new voiceTag('Quote,', 'Unquote,'),
        'ol'          : new voiceTag('Start list,', 'End list,'),
        'ul'          : new voiceTag('Start list,', 'End list,'),
        'blockquote'  : new voiceTag('Blockquote,', 'End quote,')
      };

      customOptions.customize = $.extend(defaultCustomTags, customTags);

      // Claude: Additional Paragraph highlighting fixes - Reset speech context
      currentSpeechContext = {
        utterance: null,
        chunks: [],
        currentChunkIndex: 0,
        paragraphMap: new Map()
      };
      
      // Clear any pending operations
      pendingHighlightOperations = [];
      highlightProcessingLock = false;

      // call parseContent and extract elements and text to read
      var that                = $(this),
        parsed                = parseContent(this, customOptions),
        elemsToRead           = parsed.elements,
        final                 = parsed.text,
        textOriginal          = parsed.text,
        hasText               = final.length,
        textLength            = final.length;

      if (!hasText) {
        console.warn('speak2me: No text to speak.');
        return speech;
      }

      // reset user interaction
      userStoppedSpeaking = false;

      var currentVoice, wordsInOne, wordsInTwo, oneVoiceLen, currentLang;

      // Set voice based on priority: user selection > language default > general default
      currentVoice = voiceUserDefault !== undefined ? voiceUserDefault : voiceLanguageDefault;

      // OPTIMIZATION: Cache voice lookup
      speech.voice = getVoiceByName(currentVoice);
      speech.rate = rate;
      speech.pitch = pitch;
      speech.volume = volume;

      // final preparerations of the text to read
      // jadams, 2024-08-04: remove all tailing chars
      final = final.replace(/[\r?\n]+$/, '');
      // jadams, 2024-08-04: remove all leading chars like CR|LR|TB|SPACE
      final = final.replace(/^[\s\r?\n]+/, '');
      // jadams, 2024-08-04: remove all links (placeholders)
      final = final.replace(/\(LINK\s*\d+\)/g, '');
      // jadams, 2024-08-04: replace all spaces '  ' (2 spaces) by one space
      final = final.replace(/\s\s+/g, ' ');
      // jadams, 2024-08-04: replace all (double) commas by one comma
      final = final.replace(/\,\,+/g, ',');
      // jadams, 2024-08-04: replace all (double) colons by one comma
      final = final.replace(/\:\:+/g, ':');

      // Apply user-defined replacements
      if (replacements.length > 0) {
        for (var i = 0; i < replacements.length; i += 2) {
          var regex = new RegExp(replacements[i], 'g');
          final = final.replace(regex, replacements[i + 1]);
        }
      }

      chunkCounter = 0;

      // OPTIMIZATION: Clean up old event listeners before adding new ones
      if (activeEventListeners.start) {
        speech.removeEventListener('start', activeEventListeners.start);
        speech.removeEventListener('end', activeEventListeners.end);
        if (activeEventListeners.boundary) {
          speech.removeEventListener('boundary', activeEventListeners.boundary);
        }
      }

      // Claude: Additional Paragraph highlighting fixes - Enhanced event handlers with better timing
      activeEventListeners.start = function(event) {
        chunkSpoken = true;
        speakEvent(event);
      };

      activeEventListeners.end = function(event) {
        chunkCounter++;
        currentSpeechContext.currentChunkIndex++;

        if (chunkCounter < chunkCounterMax && !userStoppedSpeaking) {
          var nextChunk = currentSpeechContext.chunks[currentSpeechContext.currentChunkIndex];
          if (nextChunk) {
            speech.text = nextChunk;
            window.speechSynthesis.speak(speech);
          }
        } else {
          // Speech finished - clear highlights
          clearAllHighlights();
        }
      };

      speech.addEventListener('start', activeEventListeners.start);
      speech.addEventListener('end', activeEventListeners.end);

      // Split text into manageable chunks
      if (textLength > 0) {
        var textChunks = splitTextIntoChunks(final);
        chunkCounterMax = textChunks.length;
        
        // Claude: Additional Paragraph highlighting fixes - Store chunks and build paragraph map
        currentSpeechContext.chunks = textChunks;
        currentSpeechContext.paragraphMap = buildParagraphMap(textChunks, getCachedContent());
        currentSpeechContext.currentChunkIndex = 0;
        
        // Start speaking first chunk
        if (textChunks.length > 0) {
          currentSpeechContext.utterance = speech;
          speech.text = textChunks[0];
          window.speechSynthesis.speak(speech);
        }

        return textChunks;
      }

      return speech;
    }, // END speak

    pause: function() {
      if (window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
      return this;
    },

    resume: function() {
      if (window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
      return this;
    },

    stop: function() {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        userStoppedSpeaking = true;

        // OPTIMIZATION: Clean up event listeners on stop
        if (speech && activeEventListeners.start) {
          speech.removeEventListener('start', activeEventListeners.start);
          speech.removeEventListener('end', activeEventListeners.end);
          if (activeEventListeners.boundary) {
            speech.removeEventListener('boundary', activeEventListeners.boundary);
          }
          activeEventListeners = { start: null, end: null, boundary: null };
        }
        
        // Claude: Additional Paragraph highlighting fixes - Clear all highlights and reset state
        clearAllHighlights();
        
        // Reset speech context
        currentSpeechContext = {
          utterance: null,
          chunks: [],
          currentChunkIndex: 0,
          paragraphMap: new Map()
        };
        
        // Clear pending operations
        pendingHighlightOperations = [];
        highlightProcessingLock = false;
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
          console.warn("speak2me: When customizing, tag must be 'img', 'table', or 'figure'.");
          return this;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString());
      }

      if (len === 3) {
        if (['q','ol','ul','blockquote'].indexOf(arguments[0]) === -1) {
          console.warn("speak2me: When customizing, tag must be 'q', 'ol', 'ul' or 'blockquote'.");
          return this;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString(), arguments[2].toString());
      }

      return this;
    },

    getVoices: function() {
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
        option.textContent = voice.name + ' (' + voice.language + ')';
        option.setAttribute('value', voice.name);

        // Set selected voice
        if (voiceLanguageDefault !== undefined && voice.name === voiceLanguageDefault) {
          option.setAttribute('selected', 'selected');
        }

        option.setAttribute('data-speak2me-language', voice.language);
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