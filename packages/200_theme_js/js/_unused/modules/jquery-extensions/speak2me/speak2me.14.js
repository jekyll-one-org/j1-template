/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/speak2me.14.js
 # speak2me v.1.14 implementation (based on Articulate.js) for J1 Theme
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
 # - SYNC FIX 13b: browser-specific timing compensation for word highlighting
 # - PARAGRAPH FIX: highligt paragraps witm multiple sentences word-wise
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
        console.warn('speak2me.core: Element not found: ' + contentSelector);
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
      selectHeadings: selectHeadings,
    };
  };

  // ---------------------------------------------------------------------------
  // private vars
  // ---------------------------------------------------------------------------
  var parseContent      = ParseContent(defaultOptions);
  var pause_spoken      = '';
  var synth             = window.speechSynthesis;

  var rateDefault               = 1;
  var pitchDefault              = 1;
  var volumeDefault             = 1;

  var scrollBlockOffset         = 100;
  var speechCycle               = 100;
  var speechMonitorCycle        = 100;
  var pauseOnSpeak              = 0;

  var currentLanguage;
  var defaultLanguage           = 'en-GB';
  var currentTranslation        = window.location.href;
  var textSliceLength           = 250;
  var minWords                  = 4;

  var scanPage;
  var scanFinished;
  var chunkCounter;
  var chunkSpoken;
  var wasRunOnce;
  var ignoreTags;
  var ignoreTagsDefault;
  var ignoreTagsUser;
  var recognizeTagsUser;
  var recognizeBlocks;
  var customTags;
  var replacements;

  var customOptions           = {};
  var myOptions               = {};
  
  var rate;
  var pitch;
  var volume;
  var rateUserDefault;
  var pitchUserDefault;
  var volumeUserDefault;
  var voiceUserDefault;
  var voiceLanguageDefault;
  var processSpeech;
  var speechMonitor;
  var lastScrollPosition;
  var voices                    = [];

  // PARAGRAPH FIX: Track current sentence offset within paragraph
  var currentSentenceOffset     = 0;
  var currentParagraphSentences = [];

  var currentParagraph;
  var previousParagraph;
  var currentParagraphHTML;
  var previousParagraphHTML;
  var currentHighlightedElement = null;

  // voice providers to be ignored
  const ignoreProvider          = 'eSpeak';

  // Browser-specific timing offsets for word highlighting sync
  const isChrome                = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox               = /Firefox/.test(navigator.userAgent);
  const isEdge                  = /Edg/.test(navigator.userAgent);
  const isSafari                = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  
  // SYNC FIX 13b: Browser-specific timing adjustments
  // These offsets compensate for different speech synthesis implementations
  const timingOffset            = isChrome  ? 0 :  
                                  isFirefox ? 50 : 
                                  isEdge    ? 0 :  
                                  isSafari  ? 100 : 
                                  0;

  // get|set default voices for browser|platform
  const voiceLanguageGoogleDefault = {
    'ar-EG': 'Google العربية',
    'cs-CZ': 'Google čeština',
    'da-DK': 'Google Dansk',
    'de-DE': 'Google Deutsch',
    'en-GB': 'Google UK English Female',
    'en-US': 'Google US English',
    'es-ES': 'Google español',
    'et-EE': 'Google eesti keel',
    'fi-FI': 'Google Suomi',
    'fr-FR': 'Google français',
    'el-GR': 'Google Ελληνικά',
    'he-IL': 'Google עברית',
    'hi-IN': 'Google हिन्दी',
    'hu-HU': 'Google Magyar',
    'id-ID': 'Google Bahasa Indonesia',
    'it-IT': 'Google italiano',
    'ja-JP': 'Google 日本語',
    'ka-GE': 'Google ქართული',
    'ko-KR': 'Google 한국어',
    'nl-NL': 'Google Nederlands',
    'nb-NO': 'Google Norsk bokmål',
    'pl-PL': 'Google polski',
    'pt-PT': 'Google português do Brasil',
    'ro-RO': 'Google Română',
    'ru-RU': 'Google русский',
    'sk-SK': 'Google Slovenčina',
    'sv-SE': 'Google Svenska',
    'th-TH': 'Google ไทย',
    'tr-TR': 'Google Türkçe',
    'uk-UA': 'Google Українська',
    'vi-VN': 'Google Tiếng Việt',
    'zh-CN': 'Google 普通话（中国大陆）'
  };

  const voiceLanguageMicrosoftDefault = {
    'ar-EG': 'Microsoft Salma Online (Natural) - Arabic (Egypt)',
    'cs-CZ': 'Microsoft Antonin Online (Natural) - Czech (Czech Republic)',
    'da-DK': 'Microsoft Christel Online (Natural) - Danish (Denmark)',
    'de-DE': 'Microsoft Katja Online (Natural) - German (Germany)',
    'en-GB': 'Microsoft Libby Online (Natural) - English (United Kingdom)',
    'en-US': 'Microsoft Aria Online (Natural) - English (United States)',
    'es-ES': 'Microsoft Elvira Online (Natural) - Spanish (Spain)',
    'et-EE': 'Microsoft Anu Online (Natural) - Estonian (Estonia)',
    'fi-FI': 'Microsoft Noora Online (Natural) - Finnish (Finland)',
    'fr-FR': 'Microsoft Denise Online (Natural) - French (France)',
    'el-GR': 'Microsoft Athina Online (Natural) - Greek (Greece)',
    'he-IL': 'Microsoft Avri Online (Natural) - Hebrew (Israel)',
    'hi-IN': 'Microsoft Swara Online (Natural) - Hindi (India)',
    'hu-HU': 'Microsoft Noemi Online (Natural) - Hungarian (Hungary)',
    'id-ID': 'Microsoft Ardi Online (Natural) - Indonesian (Indonesia)',
    'it-IT': 'Microsoft Elsa Online (Natural) - Italian (Italy)',
    'ja-JP': 'Microsoft Nanami Online (Natural) - Japanese (Japan)',
    'ka-GE': 'Microsoft Eka Online (Natural) - Georgian (Georgia)',
    'ko-KR': 'Microsoft SunHi Online (Natural) - Korean (Korea)',
    'nl-NL': 'Microsoft Colette Online (Natural) - Dutch (Netherlands)',
    'nb-NO': 'Microsoft Pernille Online (Natural) - Norwegian Bokmål (Norway)',
    'pl-PL': 'Microsoft Zofia Online (Natural) - Polish (Poland)',
    'pt-PT': 'Microsoft Raquel Online (Natural) - Portuguese (Portugal)',
    'ro-RO': 'Microsoft Alina Online (Natural) - Romanian (Romania)',
    'ru-RU': 'Microsoft Svetlana Online (Natural) - Russian (Russia)',
    'sk-SK': 'Microsoft Viktoria Online (Natural) - Slovak (Slovakia)',
    'sv-SE': 'Microsoft Sofie Online (Natural) - Swedish (Sweden)',
    'th-TH': 'Microsoft Premwadee Online (Natural) - Thai (Thailand)',
    'tr-TR': 'Microsoft Emel Online (Natural) - Turkish (Turkey)',
    'uk-UA': 'Microsoft Polina Online (Natural) - Ukrainian (Ukraine)',
    'vi-VN': 'Microsoft HoaiMy Online (Natural) - Vietnamese (Vietnam)',
    'zh-CN': 'Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)'
  };

  const voiceLanguageFirefoxDefault = {
    'ar-EG': 'Google العربية',
    'cs-CZ': 'Google čeština',
    'da-DK': 'Google Dansk',
    'de-DE': 'Google Deutsch',
    'en-GB': 'Google UK English Female',
    'en-US': 'Google US English',
    'es-ES': 'Google español',
    'et-EE': 'Google eesti keel',
    'fi-FI': 'Google Suomi',
    'fr-FR': 'Google français',
    'el-GR': 'Google Ελληνικά',
    'he-IL': 'Google עברית',
    'hi-IN': 'Google हिन्दी',
    'hu-HU': 'Google Magyar',
    'id-ID': 'Google Bahasa Indonesia',
    'it-IT': 'Google italiano',
    'ja-JP': 'Google 日本語',
    'ka-GE': 'Google ქართული',
    'ko-KR': 'Google 한국어',
    'nl-NL': 'Google Nederlands',
    'nb-NO': 'Google Norsk bokmål',
    'pl-PL': 'Google polski',
    'pt-PT': 'Google português do Brasil',
    'ro-RO': 'Google Română',
    'ru-RU': 'Google русский',
    'sk-SK': 'Google Slovenčina',
    'sv-SE': 'Google Svenska',
    'th-TH': 'Google ไทย',
    'tr-TR': 'Google Türkçe',
    'uk-UA': 'Google Українська',
    'vi-VN': 'Google Tiếng Việt',
    'zh-CN': 'Google 普通话（中国大陆）'
  };

  // Claude: paragraph highlighting fixes - Cache for paragraph lookups
  var paragraphCache = new Map();
  var paragraphIdCounter = 0;
  var headingsArray;

  // Track active event listeners to allow proper cleanup
  var activeEventListeners = {
    onstart: null,
    onend: null,
    onboundary: null
  };

  // OPTIMIZATION: Cache content container for reuse
  var cachedContent = null;
  function getCachedContent() {
    if (!cachedContent) {
      cachedContent = $(myOptions.contentSelector);
    }
    return cachedContent;
  }

  // Claude: paragraph highlighting fixes - Centralized highlight clearing
  function clearAllHighlights() {
    $('.tts-karaoke-highlight-paragraph').removeClass('tts-karaoke-highlight-paragraph');
    $('.tts-karaoke-highlight-word').removeClass('tts-karaoke-highlight-word');
    
    // reset element id for word-based highlighting
    var highlighted = document.getElementById('speak_highlighted');
    if (highlighted) {
      highlighted.removeAttribute('id');
    }
    
    currentHighlightedElement = null;
  }

  function setHighlightParagraph(speak2meId) {
    const selector  = `[data-speak2me-id="${speak2meId}"]`;
    const $element  = document.querySelector(selector);

    // set highlight
    $element.classList.add('tts-karaoke-highlight-paragraph');

    // save speak2meId for next paragraph
    currentHighlightedElement = speak2meId;
  }

  function removeParagrapHighlight(speak2meId) {
    const selector  = `[data-speak2me-id="${speak2meId}"]`;
    const $element  = document.querySelector(selector);

    if ($element !== null) {
      $element.classList.remove('tts-karaoke-highlight-paragraph');
    }
  }

  function pauseOnSpeak(pause) {
    var pauseThis = new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve();
      }, pause);
    });

    pauseThis
      .then(function() {
        return new Promise(function(resolve, reject) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          resolve();
        });
      });
  }

  // SYNC FIX 13b: Enhanced word highlighting with browser compensation
  function highlightWord(charIndex) {
    var spans = document.querySelectorAll('#speak_highlighted span');
    if (!spans.length) return;

//  var text = previousParagraphHTML.replace(/<[^>]*>/g, '');
    var text = previousParagraphHTML;
    var currentPos = 0;
    var targetWordIndex = -1;

    // PARAGRAPH FIX: Adjust charIndex by adding the offset of previous sentences
    var adjustedCharIndex = charIndex + currentSentenceOffset;

    // SYNC FIX 13b: Apply browser-specific timing compensation
    // The charIndex from the boundary event may be slightly ahead or behind
    // depending on the browser's speech synthesis timing
    var compensatedCharIndex = Math.max(0, adjustedCharIndex);

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

  // PARAGRAPH FIX: Split paragraph text into sentences to track offsets
  function splitParagraphIntoSentences(text) {
    // Split by period, but keep the period with each sentence
    var sentences = text.split(/\.\s+/).map(function(s, index, arr) {
      // Add period back except for the last element if it's empty
      return (index < arr.length - 1 || s.trim().length > 0) ? s.trim() + '.' : s.trim();
    }).filter(function(s) {
      return s.length > 0;
    });
    
    return sentences;
  }

  // PARAGRAPH FIX: Calculate character offset for a sentence within the paragraph
  function calculateSentenceOffset(sentences, sentenceIndex) {
    var offset = 0;
    for (var i = 0; i < sentenceIndex && i < sentences.length; i++) {
      // Add sentence length plus space (except for first sentence)
      offset += sentences[i].length + (i > 0 ? 1 : 0);
    }
    return offset;
  }

  // split text for word-based highlighting
  function prepareParagraphToHighlighWords(text) {

    // PARAGRAPH FIX: Split the paragraph into sentences for tracking
    currentParagraphSentences = splitParagraphIntoSentences(text);
    currentSentenceOffset = 0; // Reset to 0 when a new paragraph starts

    // clean text for unwanted white spaces and split text into words
    const words = text
      .replace(/\n+/, '')
      .replace(/^\s+/, '')
      .split(/\s+/);

    // mark currently spoken paragraph by id 'speak_highlighted'
    document.querySelector('.tts-karaoke-highlight-paragraph').id = 'speak_highlighted';

    currentParagraph     = document.getElementById('speak_highlighted');
    currentParagraphHTML = currentParagraph.innerHTML;

    // split text into spans (for word-based highlighting
    currentParagraph.innerHTML  = '';
    words.forEach((word, index) => {
      const span          = document.createElement('span');
      span.textContent    = word + ' ';   // add single space between words
      span.dataset.index  = index;
//    span.className      = 'data-word-index';

      currentParagraph.appendChild(span);
    });

    // store for later use to REBUILD already spoken paragraph
    previousParagraph     = currentParagraph;
    previousParagraphHTML = currentParagraphHTML;
  }

  // Claude: paragraph highlighting fixes - enhanced text normalization
  function normalizeText(text) {
    if (!text) return '';
    text
      .trim()
      .replace(/\s+/g, ' ')                    // Normalize whitespace
      .replace(/['"'""`´]/g, '')               // Remove quotes
      .replace(/[—–-]+/g, '-')                 // Normalize dashes
      .replace(/[\.,!?;:]+/g, '')              // Remove punctuation for matching
      .replace(/\u00A0/g, ' ')                 // Replace non-breaking spaces
      .replace(/[\u200B-\u200D\uFEFF]/g, '')   // Remove zero-width characters
      .toLowerCase();

      return text;
  }

  // Claude: paragraph highlighting fixes - Improved text matching with fuzzy logic
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
        var score = lengthScore * 0.7 + positionScore * 0.3;
        
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatch = $elem;
        }
      }
    });

    return bestMatch;
  }

  // Claude: paragraph highlighting fixes
  // Build paragraph cache for faster lookups (NOT used)
//   function buildParagraphCache() {
//     paragraphCache.clear();
//     var $contentCached = getCachedContent();

// //  $contentCached.find('p, h1, h2, h3, h4, h5, h6, li, dt, dd').each(function() {    
//     $contentCached.find('p, dt, h1, h2, h3, h4, h5, h6').each(function() {
//       var $elem = $(this);
//       var speak2meId = $elem.attr('data-speak2me-id');
      
//       if (speak2meId) {
//         // Store both the element and its normalized text
//         paragraphCache.set(speak2meId, {
//           element: $elem,
//           normalizedText: normalizeText($elem.text()),
//           offsetTop: Math.round($elem.offset().top)
//         });
//       }
//     });
//   }

  // Claude: paragraph highlighting fixes - Enhanced paragraph lookup (NOT used)
  // function findParagraphForChunk(chunk) {
  //   // Method 1: Try cached paragraph by ID (fastest and most reliable)
  //   if (chunk.speak2meId && paragraphCache.has(chunk.speak2meId)) {
  //     var cached = paragraphCache.get(chunk.speak2meId);
  //     // Verify the element still exists in DOM
  //     if (cached.element && cached.element.length > 0 && $.contains(document.documentElement, cached.element[0])) {
  //       return cached.element;
  //     }
  //   }
    
  //   // Method 2: Try stored paragraph reference
  //   if (chunk.$paragraph && chunk.$paragraph.length > 0 && $.contains(document.documentElement, chunk.$paragraph[0])) {
  //     return chunk.$paragraph;
  //   }
    
  //   // Method 3: Try text matching with the section text
  //   if (chunk.sectionText) {
  //     var $found = findParagraphByText(chunk.sectionText, getCachedContent());
  //     if ($found && $found.length > 0) {
  //       return $found;
  //     }
  //   }
    
  //   // Method 4: Try text matching with first part of chunk text
  //   if (chunk.text && chunk.text.length > 20) {
  //     var searchText = chunk.text.substring(0, 50).replace(/\s+/g, ' ').trim();
  //     var $found = findParagraphByText(searchText, getCachedContent());
  //     if ($found && $found.length > 0) {
  //       return $found;
  //     }
  //   }
    
  //   return null;
  // }

  // Claude: paragraph highlighting fixes - Centralized highlight management (NOT used)
  // function setHighlight($element) {
  //   // remove previous highlight
  //   if (currentHighlightedElement) {
  //     currentHighlightedElement.removeClass('tts-karaoke-highlight-paragraph');
  //   }
    
  //   // add new highlight
  //   if ($element && $element.length > 0) {
  //     $element.addClass('tts-karaoke-highlight-paragraph');
  //     currentHighlightedElement = $element;
      
  //     // scroll to element with better error handling
  //     try {
  //       var elementTop = $element.offset().top;
  //       var scrollTop = elementTop - scrollBlockOffset;
        
  //       // Only scroll if element is not already visible
  //       var viewportTop = $(window).scrollTop();
  //       var viewportBottom = viewportTop + $(window).height();
        
  //       if (elementTop < viewportTop || elementTop > viewportBottom) {
  //         $('html, body').animate({
  //           scrollTop: scrollTop
  //         }, 500);
  //       }
  //     } catch (e) {
  //       console.warn('speak2me.core: Error scrolling to element:', e);
  //     }
  //   }
  // }

  // scan the content page to create the required data structures
  function scanPage(obj) {
    const start       = obj.startLine;
    const $self       = getCachedContent();
    var scanInterval  = 100;
    var lineCounter   = 0;
    var linesScanned  = 0;

    // Claude: paragraph highlighting fixes - Ensure cache is cleared before scan
    paragraphCache.clear();
    paragraphIdCounter = 0;

    // page scanner
    var scanPageInterval = setInterval(function() {
      $self.find('p, dt, h1, h2, h3, h4, h5, h6').each(function() {
        lineCounter++;
        if (lineCounter >= start) {
          var $this = $(this);
          
          // Claude: paragraph highlighting fixes - Assign IDs during scan
          if (!$this.attr('data-speak2me-id')) {
            $this.attr('data-speak2me-id', 'speak2me-p-' + (paragraphIdCounter++));
          }
          
          linesScanned = lineCounter;
        }
      });

      // all content elements scanned
      if (linesScanned === lineCounter) {
        // Claude: paragraph highlighting fixes - Build cache after IDs assigned
        // buildParagraphCache();
        scanFinished = true;
        clearInterval(scanPageInterval);
        console.debug('speak2me.core: page scanning finished');
      }
    }, scanInterval);
  }

  // convert non-numeric characters to their word equivalents, for example, '$' to 'dollars', and so on
  function convertNonNumeric(match) {
    var str       = match.toString();
    var obj       = match;
    var len       = obj.length;
    var converted = match;

    if (str.match(/^\$/))       { converted = str.replace(/\$/g, ' dollars ');    }
    if (str.match(/^£/))        { converted = str.replace(/£/g, ' pounds ');      }
    if (str.match(/^€/))        { converted = str.replace(/€/g, ' euros ');       }
    if (str.match(/^¥/))        { converted = str.replace(/¥/g, ' yen ');         }
    if (str.match(/^\u20bd/))   { converted = str.replace(/\u20bd/g, ' rubles '); }

    if (str.match(/\%$/))       { converted = str.replace(/\%/g, ' percent ');    }

    return converted;
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
//    voiceTags['dt']                   = new voiceTag('.', '');
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
      voiceTags['parallax-quoteblock']  = new voiceTag('', '');
      voiceTags['blockquote']           = new voiceTag('', '');
      voiceTags['quoteblock']           = new voiceTag('', '');

      var pauseBetweenSentences = 250;

      // set default values for ignored DOM elements
      ignoreTagsDefault = [
        'a',
        'noscript',
        'script',
        'style',
        'textarea',
        'button',
        'select',
        'datalist'
      ];

      ignoreTags = ignoreTagsDefault;
      ignoreTagsUser = myOptions.ignore || [];
      recognizeTagsUser = myOptions.recognize || [];
      replacements = myOptions.replace || [];
      customTags = myOptions.customize || {};
      rate = rateUserDefault !== undefined ? rateUserDefault : (myOptions.rate || rateDefault);
      pitch = pitchUserDefault !== undefined ? pitchUserDefault : (myOptions.pitch || pitchDefault);
      volume = volumeUserDefault !== undefined ? volumeUserDefault : (myOptions.volume || volumeDefault);

      // NOTE: set voice for the current browser
      if (voiceUserDefault !== undefined) {
        speech.voice = voices.find(function(v) { return v.name === voiceUserDefault; });
      } else if (voiceLanguageDefault !== undefined) {
        speech.voice = voices.find(function(v) { return v.name === voiceLanguageDefault; });
      }

      // setting speaking params to browser defaults
      speech.rate   = rate;
      speech.pitch  = pitch;
      speech.volume = volume;

      // OPTIMIZATION: Combine processing with event monitoring in single interval
      processSpeech = setInterval(function() {
        // scan page to find correct positions for scrolling
        // and highlighting. Wait for scan NOT finished
        if (!scanFinished) {
          return; // Don't start processing until scan is complete
        }

        // (re-)create the text and data structures for the page content
        if (!processed) {
          toSpeak   = processDOMelements(_this.clone(), voiceTags, ignoreTags).text();
          finished  = myOptions.finished || function() {};
          processed = true;
        }

        if (!obj) {
          lastScrollPosition  = 0;
          chunkCounter        = 0;
          chunkSpoken         = false;
          wasRunOnce          = false;

          obj = {
            toSpeak: toSpeak,
            myOptions: myOptions
          };
        }

        // STABILITY: Validate speech synthesis availability
        if (!synth) {
          console.error('speak2me.core: Speech synthesis not available');
          clearInterval(processSpeech);
          return this;
        }

        var speakerObj, chunks;

        // create the speaker object that gets spoken by the browser
        if (synth && synth.speaking === false && obj && obj.toSpeak && !myOptions.isPaused) {
          console.debug('speak2me.core: setting event handlers on start|end|boundary');

          speakerObj = {
            voiceTags: voiceTags,
            ignoreTags: ignoreTags
          };

          chunks = splitTextIntoChunks(obj.toSpeak);

          // PARAGRAPH FIX: Find which sentence index corresponds to the current chunk
          function findSentenceIndexForChunk(chunk, paragraphSentences) {
            var chunkTextNormalized = chunk.text.trim().replace(/\s+/g, ' ');
            
            for (var i = 0; i < paragraphSentences.length; i++) {
              var sentenceNormalized = paragraphSentences[i].trim().replace(/\s+/g, ' ');
              if (chunkTextNormalized === sentenceNormalized || 
                  chunkTextNormalized.indexOf(sentenceNormalized.substring(0, Math.min(20, sentenceNormalized.length))) === 0) {
                return i;
              }
            }
            return -1;
          }

          activeEventListeners.onboundary = (event) => {
            const startIndex  = event.charIndex;
            const currentWord = event.utterance.text.substring(startIndex).split(/\s+/)[0];

            if (currentWord) {
             console.debug(`speak2me.core, utterance.onboundary: spoken word: '${currentWord}' at startIndex: ${startIndex}`);

              // uncomment if highlighting is needed
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
//              console.warn('speak2me.core, onstart:\n error accessing loose text:', currentTargetText);
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

              // PARAGRAPH FIX: Update sentence offset for the current chunk
              var currentChunk = chunks[chunkCounter];
              if (currentChunk && currentParagraphSentences.length > 0) {
                var sentenceIndex = findSentenceIndexForChunk(currentChunk, currentParagraphSentences);
                if (sentenceIndex >= 0) {
                  currentSentenceOffset = calculateSentenceOffset(currentParagraphSentences, sentenceIndex);
                  console.debug(`speak2me.core, findSentenceIndexForChunk: sentence ${sentenceIndex} starts at offset ${currentSentenceOffset}`);
                }
              }

            } else {
              console.debug(`speak2me.core, onstart: highlight MOT changed on: ${speak2meId}`);
              
              // PARAGRAPH FIX: Even if paragraph hasn't changed, update offset for next sentence
              var currentChunk = chunks[chunkCounter];
              if (currentChunk && currentParagraphSentences.length > 0) {
                var sentenceIndex = findSentenceIndexForChunk(currentChunk, currentParagraphSentences);
                if (sentenceIndex >= 0) {
                  currentSentenceOffset = calculateSentenceOffset(currentParagraphSentences, sentenceIndex);
                  console.debug(`speak2me.core, findSentenceIndexForChunk: (same paragraph) sentence ${sentenceIndex} starts at offset ${currentSentenceOffset}`);
                }
              }
            }
          };

          activeEventListeners.onend = (event) => {
            const speak2meId            = event.currentTarget.speak2meId;
            var selector                = `[data-speak2me-id="${speak2meId}"]`;
            const $element              = document.querySelector(selector) || null;
            const isHighlighted         = $element?.classList.contains('tts-karaoke-highlight-paragraph');
            const isAlredadyHighlighted = (speak2meId === currentHighlightedElement) ? true : false;
            var currentTargetText       = event.currentTarget.text;

            // window.speechSynthesis.pause();

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
//              var innerText = node.innerText.replace(/[?!]/g, '') + pause_spoken;
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
        var endSubString = Math.min(text.length, sliceLength);
        var slicedText = text.slice(startSubString, endSubString);

        // OPTIMIZATION: simplified word count validation
        if (wordCount(slicedText) < wordsMin) {
          return undefined;
        }

        return slicedText;
      }

      // process text chunks
      function processTextChunks(speaker, text) {
        // scroll to the top element found
        if (myOptions.scrollToSpokenContent) {
          console.debug('speak2me.core: scroll to top element');
          var offset = chunks[0].offsetTop - scrollBlockOffset;
          $('html, body').animate({ scrollTop: offset }, 500);
        }

        // monitor the speaking process
        speechMonitor = setInterval(function() {
          if (synth && synth.speaking === false) {

            if (chunkCounter >= chunks.length) {
              clearAllHighlights();
              console.debug('speak2me.core: all text read|spoken, finished');

              // callback function
              finished();

              chunkSpoken = false;

              // OPTIMIZATION: Clean up event listeners when done
              if (speaker && activeEventListeners.onstart) {
                speaker.removeEventListener('start', activeEventListeners.onstart);
                speaker.removeEventListener('end', activeEventListeners.onend);
                if (activeEventListeners.onboundary) {
                  speaker.removeEventListener('boundary', activeEventListeners.onboundary);
                }
                activeEventListeners = {
                  onstart:      null,
                  onend:        null,
                  onboundary:   null
                };
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
          } else {
            chunkSpoken = false;
            chunkCounter++;

            if (chunks[chunkCounter] && chunks[chunkCounter].offsetTop !== undefined && chunkCounter > 0) {
              if (chunks[chunkCounter].offsetTop !== chunks[chunkCounter - 1].offsetTop) {
                lastScrollPosition = chunks[chunkCounter - 1].offsetTop;
              }

              if (myOptions.scrollToSpokenContent) {
                var offsetScroll = chunks[chunkCounter].offsetTop - scrollBlockOffset;
                console.debug('speak2me.core: scroll to block - offsetScroll:', offsetScroll);
                $('html, body').animate({ scrollTop: offsetScroll }, 500);
              }
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

        // Remove tags from the "ignoreTags" array
        if (recognizeTagsUser.length > 0) {
          recognizeTagsUser.forEach(function(tag) {
            var index = ignoreTags.indexOf(tag);
            if (index > -1) {
              ignoreTags.splice(index, 1);
            }
          });
        }

        // Remove DOM objects listed in the "ignoreTags" array
        ignoreTags.forEach(function(tag) {
          clone.find(tag).addBack(tag).not('[data-speak2me-recognize]').html('');
        });

        // Remove DOM objects specified in the "ignoreTagsUser" array
        if (ignoreTagsUser.length > 0) {
          ignoreTagsUser.forEach(function(tag) {
            clone.find(tag).addBack(tag).not('[data-speak2me-recognize]').html('');
          });
        }

        // Remove DOM objects marked by "data-speak2me-ignore"
        clone.find('[data-speak2me-ignore]').addBack('[data-speak2me-ignore]').html('');

        // Remove DOM objects marked by class "speak2me-ignore"
        clone.find('.speak2me-ignore').addBack('.speak2me-ignore').html('');

        // Search for prepend data specified by "data-speak2me-prepend"
        clone.find('[data-speak2me-prepend]').addBack('[data-speak2me-prepend]').each(function() {
          copy = $(this).data('speak2me-prepend');
          $(this).prepend(copy + ' ');
        });

        // Search for append data specified by "data-speak2me-append"
        clone.find('[data-speak2me-append]').addBack('[data-speak2me-append]').each(function() {
          copy = $(this).data('speak2me-append');
          $(this).append(' ' + copy);
        });

        // Search for tags to prepend and append specified by the "voiceTags" array
        for (var tag in voiceTags) {
          if (voiceTags.hasOwnProperty(tag)) {
            clone.find(tag).each(function() {
              var tagToUse = customTags[tag] || voiceTags[tag];
              $(this).prepend(tagToUse.prepend + pause_spoken);
              $(this).append(tagToUse.append + pause_spoken);
            });
          }
        }

        // Add a dot for a spoken pause to heading elements
        clone.find('h1,h2,h3,h4,h5,h6').addBack('h1,h2,h3,h4,h5,h6').each(function() {
          var text = $(this)[0].innerText;
          text = text
            .trim()
            .replace(/\s+/g, ' ') + '.';

          $(this)[0].innerText = text;
        });

        // Add a dot for a spoken pause to list and definition elements
        clone.find('li,dt').addBack('li,dt').each(function() {
          var text = $(this)[0].innerText;
          text = text
            .trim()
            .replace(/\s+/g, ' ') + '.';

          $(this)[0].innerText = text;
        });

        // Add pause to <br> tags
        clone.find('br').each(function() {
          $(this).append(pause_spoken);
        });

        // Process <figure> tags
        clone.find('figure').addBack('figure').each(function() {
          copy = $(this).find('figcaption').html();
          prepend = customTags['figure'] ? customTags['figure'].prepend : voiceTags['figure'].prepend;

          if (copy !== undefined && copy !== '') {
            $('<div>' + prepend + pause_spoken + copy + '</div>').insertBefore(this);
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

        // Process <blockquote> tags
        processBlock('blockquote', 'blockquote', function($elem) {
          var cite = $elem.find('cite').text();
          var quote = $elem.text().replace(cite, '').trim();
          if (quote) {
            return {
              prefix: '',
              content: quote + (cite ? ' (Quote from ' + cite + ')' : '')
            };
          }
          return null;
        });

        // Process <q> tags
        processBlock('q', 'q', function($elem) {
          var cite = $elem.attr('cite');
          var quote = $elem.text().trim();
          if (quote) {
            return {
              prefix: '',
              content: quote + (cite ? ' (Quote from ' + cite + ')' : '')
            };
          }
          return null;
        });

        // Process <ol> tags
        processBlock('ol', 'ol', function($elem) {
          var items = [];
          $elem.find('> li').each(function(index) {
            var text = $(this).text().trim();
            if (text) {
              items.push('Number ' + (index + 1) + ': ' + text);
            }
          });
          if (items.length) {
            return { prefix: '', content: items.join('. ') };
          }
          return null;
        });

        // Process <ul> tags
        processBlock('ul', 'ul', function($elem) {
          var items = [];
          $elem.find('> li').each(function() {
            var text = $(this).text().trim();
            if (text) {
              items.push('Item: ' + text);
            }
          });
          if (items.length) {
            return { prefix: '', content: items.join('. ') };
          }
          return null;
        });

        // Process <table> tags
        processBlock('table', 'table', function($elem) {
          var caption = $elem.find('caption').text().trim();
          var summary = $elem.attr('summary');
          
          if (caption || summary) {
            return {
              prefix: '',
              content: caption || summary
            };
          }
          return null;
        });

        // Convert non-numeric characters
        var textContent = clone.text();
        
        // OPTIMIZATION: Combined regex pattern for non-numeric conversion
        textContent = textContent.replace(/[$£€¥\u20bd]\d+(?:\.\d+)?|\d+(?:\.\d+)?%/g, convertNonNumeric);

        // Apply custom replacements
        if (replacements.length > 0) {
          for (var i = 0; i < replacements.length - 1; i += 2) {
            var pattern = new RegExp(replacements[i], 'g');
            textContent = textContent.replace(pattern, replacements[i + 1]);
          }
        }

        clone.text(textContent);
        return clone;
      }

      return this;
    },

    pause: function() {
      if (!synth) return this;
      
      if (synth.speaking && !synth.paused) {
        synth.pause();
      }

      return this;
    },

    resume: function() {
      if (!synth) return this;
      
      if (synth.paused) {
        synth.resume();
      }

      return this;
    },

    stop: function() {
      if (!synth) return this;
      
      if (synth.speaking) {
        // reset chunk counter|bool for word-highlighting
        chunkCounter  = 0;
        chunkSpoken   = false;
        wasRunOnce    = false;

        synth.cancel();

        if (processSpeech) {
          clearInterval(processSpeech);
        }
        if (speechMonitor) {
          // OPTIMIZATION: Clean up event listeners when stopping
          if (speaker && activeEventListeners.start) {
            speaker.removeEventListener('start', activeEventListeners.start);
            speaker.removeEventListener('end', activeEventListeners.end);
            if (activeEventListeners.boundary) {
              speaker.removeEventListener('boundary', activeEventListeners.boundary);
            }
          }
          
          activeEventListeners = {
            onstart:      null,
            onend:        null,
            onboundary:   null
          };

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
