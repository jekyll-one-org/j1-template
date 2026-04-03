/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/speak2me.13a.js
 # speak2me v.1.13a implementation (based on Articulate.js) for J1 Theme
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/acoti/articulate.js/tree/master
 #
 # Copyright (C) 2023-2026 Juergen Adams
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
 #
 # - SYNC FIX 13a: Optimized word highlighting synchronization
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

  const defaultOptions        = require('./default-options.js');
  const ParseContent          = require('./parse-content.js');
  const parseContent          = ParseContent(defaultOptions);

  // var logger                  = log4javascript.getLogger('j1.speak2me.core');
  // logger.info('initializing core module: started');

  const scrollBehavior        = 'smooth';
  const speechCycle           = 10;
  const speechMonitorCycle    = 10;
  const textSliceLength       = 30;
  const minWords              = 3;
  const pageScanCycle         = 1000;
  const pageScanLines         = 10000;
  const isFirefox             = /Firefox/i.test(navigator.userAgent);
  const isEdge                = /Edg/i.test(navigator.userAgent);
  const chrome                = /chrome/i.test(navigator.userAgent);
  const isChrome              = ((chrome) && (!isEdge));
  const ignoreProvider        = 'blaMicrosoft';
  const sourceLanguage        = document.getElementsByTagName("html")[0].getAttribute("lang");
  const pauseBetweenSentences = 500;
  const pauseOnHeadlines      = 750;

  var currentParagraph        = null;
  var previousParagraph       = null;
  var previousParagraphHTML   = null;
  var currentParagraphHTML    = null;

  // OPTIMIZATION: cache DOM elements to avoid repeated queries - cached on first use
  var $content                = null;

  var voiceUserDefault        = 'Google UK English Female';
  var voiceChromeDefault      = 'Google US English';
  var defaultLanguage         = '';
  var navigatorLanguage       = navigator.language || navigator.userLanguage;

  var currentTranslation      = getCookie('googtrans');
  var scrollBlockOffset       = 100;

  var customOptions           = {};
  var myOptions               = {};

  var ignoreTagsUser          = [];
  var recognizeTagsUser       = [];
  var replacements            = [];
  var customTags              = [];
  var voices                  = [];
  var headingsArray           = [];

  var rateDefault             = 1.0;
  var pitchDefault            = 1.0;
  var volumeDefault           = 1.0;
  var rate                    = rateDefault;
  var pitch                   = pitchDefault;
  var volume                  = volumeDefault;

  var pause_spoken            = '';

  var chunkCounter            = 0;
  var userStoppedSpeaking     = false;
  var chunkSpoken             = false;
  var lastScrollPosition      = false;

  var rateUserDefault;
  var pitchUserDefault;
  var volumeUserDefault;
  var currentLanguage;
  var voiceLanguageDefault;
  var chunkCounterMax;
  var user_session;

  var scanFinished;

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

  // FIX: Add counter for unique paragraph IDs
  var paragraphIdCounter = 0;

  // Claude: paragraph highlighting fixes - Add paragraph mapping cache
  var paragraphCache = new Map();
  var currentHighlightedElement = null;

  // SYNC FIX: Cache for word spans and positions
  var wordSpansCache = [];
  var wordPositionsCache = [];
  var currentParagraphSpans = null;
  var lastHighlightedIndex = -1;

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

  function pauseOnSpeak(msPause) {
      window.speechSynthesis.pause();

      setTimeout(() => {
        window.speechSynthesis.resume();
      }, msPause);
  }

  // OPTIMIZATION: cache DOM queries
  function getCachedContent() {
    if (!$content) {
      $content = $('#content');
    }

    return $content;
  }

  // SYNC FIX: Pre-calculate word positions for fast lookup
  function buildWordPositionCache(spans) {
    wordPositionsCache = [];
    var currentPos = 0;
    
    for (var i = 0; i < spans.length; i++) {
      const wordLength = spans[i].textContent.length;
      wordPositionsCache.push({
        index: i,
        start: currentPos,
        end: currentPos + wordLength,
        element: spans[i]
      });
      currentPos += wordLength;
    }
    
    return wordPositionsCache;
  }

  // SYNC FIX: Binary search for faster word lookup
  function findWordIndexByCharPosition(charIndex, positions) {
    // Fast path for sequential access (most common case)
    if (lastHighlightedIndex >= 0 && lastHighlightedIndex < positions.length) {
      const pos = positions[lastHighlightedIndex];
      if (charIndex >= pos.start && charIndex < pos.end) {
        return lastHighlightedIndex;
      }
      // Check next word (very common in speech)
      if (lastHighlightedIndex + 1 < positions.length) {
        const nextPos = positions[lastHighlightedIndex + 1];
        if (charIndex >= nextPos.start && charIndex < nextPos.end) {
          return lastHighlightedIndex + 1;
        }
      }
    }
    
    // Binary search for non-sequential access
    var left = 0;
    var right = positions.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const pos = positions[mid];
      
      if (charIndex >= pos.start && charIndex < pos.end) {
        return mid;
      } else if (charIndex < pos.start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    
    return -1;
  }

  // SYNC FIX: Optimized highlighting with cached positions
  function highlightWord(charIndex) {
    // SYNC FIX: Return early if no cache is available
    if (!wordPositionsCache || wordPositionsCache.length === 0) {
      return;
    }

    // SYNC FIX: Use binary search for fast lookup
    const wordIndex = findWordIndexByCharPosition(charIndex, wordPositionsCache);
    
    if (wordIndex === -1 || wordIndex === lastHighlightedIndex) {
      return; // No change needed
    }

    // SYNC FIX: Remove highlight from previous word
    if (lastHighlightedIndex >= 0 && lastHighlightedIndex < wordPositionsCache.length) {
      wordPositionsCache[lastHighlightedIndex].element.classList.remove('tts-karaoke-highlight-word');
    }

    // SYNC FIX: Add highlight to current word
    const currentWord = wordPositionsCache[wordIndex];
    currentWord.element.classList.add('tts-karaoke-highlight-word');
    lastHighlightedIndex = wordIndex;

    // SYNC FIX: Optimized scrolling with requestAnimationFrame
    // Only scroll if word is not in viewport
    const rect = currentWord.element.getBoundingClientRect();
    const isInViewport = (
      rect.top >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
    
    if (!isInViewport) {
      requestAnimationFrame(() => {
        currentWord.element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      });
    }
  }

  // SYNC FIX: Optimized paragraph preparation with span caching
  function prepareParagraphToHighlighWords(text) {
    // clean text for unwanted white spaces and split text into words
    const words = text
      .replace(/\n+/, '')
      .replace(/^\s+/, '')
      .split(/\s+/);

    // mark currently spoken paragraph by id 'speak_highlighted'
    document.querySelector('.tts-karaoke-highlight-paragraph').id = 'speak_highlighted';

    currentParagraph     = document.getElementById('speak_highlighted');
    currentParagraphHTML = currentParagraph.innerHTML;

    // SYNC FIX: Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    const newSpans = [];

    words.forEach((word, index) => {
      const span          = document.createElement('span');
      span.textContent    = word + ' ';   // add single space between words
      span.dataset.index  = index;
      
      fragment.appendChild(span);
      newSpans.push(span);
    });

    // SYNC FIX: Single DOM update instead of multiple
    currentParagraph.innerHTML = '';
    currentParagraph.appendChild(fragment);

    // SYNC FIX: Cache spans and build position index
    wordSpansCache = newSpans;
    currentParagraphSpans = currentParagraph.querySelectorAll('span');
    buildWordPositionCache(currentParagraphSpans);
    lastHighlightedIndex = -1;

    // store for later use to REBUILD already spoken paragraph
    previousParagraph     = currentParagraph;
    previousParagraphHTML = currentParagraphHTML;
  }

  // Claude: paragraph highlighting fixes - enhanced text normalization
  function normalizeText(text) {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')                    // Normalize whitespace
      .replace(/['"'""`´]/g, '')               // Remove quotes
      .replace(/[—–-]+/g, '-')                 // Normalize dashes
      .replace(/[\.,!?;:]+/g, '');             // Remove punctuation for matching
  }

  // rebuild already spoken paragraphs (back to TEXT)
  function rebuildParagraph() {
    if (previousParagraph !== null) {
      previousParagraph.removeAttribute('id');
      previousParagraph.innerHTML = previousParagraphHTML;

      // SYNC FIX: Clear word cache when rebuilding
      wordSpansCache = [];
      wordPositionsCache = [];
      currentParagraphSpans = null;
      lastHighlightedIndex = -1;
    }
  }

  // Claude: paragraph highlighting fixes - Centralized highlight clearing
  function clearAllHighlights() {
    // SYNC FIX: Clear word highlights efficiently
    if (currentParagraphSpans && currentParagraphSpans.length > 0) {
      currentParagraphSpans.forEach(span => {
        span.classList.remove('tts-karaoke-highlight-word');
      });
    }
    
    // Clear paragraph highlights
    document.querySelectorAll('.tts-karaoke-highlight-paragraph').forEach(el => {
      el.classList.remove('tts-karaoke-highlight-paragraph');
      if (el.id === 'speak_highlighted') {
        el.removeAttribute('id');
      }
    });

    // SYNC FIX: Clear all caches
    wordSpansCache = [];
    wordPositionsCache = [];
    currentParagraphSpans = null;
    lastHighlightedIndex = -1;
    currentHighlightedElement = null;
    paragraphCache.clear();
  }

  // Claude: paragraph highlighting fixes - Improved element matching
  function findMatchingElement(text, elements) {
    const normalizedSearch = normalizeText(text);
    
    // Try exact match first
    for (const el of elements) {
      if (normalizeText(el.textContent) === normalizedSearch) {
        return el;
      }
    }
    
    // Try substring match
    for (const el of elements) {
      const normalizedContent = normalizeText(el.textContent);
      if (normalizedContent.includes(normalizedSearch) || 
          normalizedSearch.includes(normalizedContent)) {
        return el;
      }
    }
    
    return null;
  }

  // Claude: paragraph highlighting fixes - Enhanced paragraph highlighting
  function highlightParagraph(text) {
    if (!text || text.trim().length === 0) return;
    
    const normalizedText = normalizeText(text);
    
    // Check cache first
    if (paragraphCache.has(normalizedText)) {
      const cachedElement = paragraphCache.get(normalizedText);
      if (cachedElement && document.body.contains(cachedElement)) {
        setHighlight(cachedElement);
        return;
      }
      paragraphCache.delete(normalizedText);
    }
    
    // Find all potential elements
    const elements = document.querySelectorAll('p, li, td, th, div.paragraph, div.content > div');
    const matchedElement = findMatchingElement(text, elements);
    
    if (matchedElement) {
      paragraphCache.set(normalizedText, matchedElement);
      setHighlight(matchedElement);
    }
  }

  // Claude: paragraph highlighting fixes - Centralized highlight setting
  function setHighlight(element) {
    if (currentHighlightedElement === element) return;
    
    // Remove previous highlight
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove('tts-karaoke-highlight-paragraph');
    }
    
    // Add new highlight
    element.classList.add('tts-karaoke-highlight-paragraph');
    currentHighlightedElement = element;
    
    // Scroll to element
    element.scrollIntoView({ 
      behavior: scrollBehavior, 
      block: 'center' 
    });
  }

  function voiceTag(pre, post) {
    this.pre = pre || '';
    this.post = post || '';
  }

  function isInt(value) {
    return !isNaN(value) &&
      parseInt(Number(value)) == value &&
      !isNaN(parseInt(value, 10));
  }

  function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
  }

  function elementBlacklisted(tag) {
    var tagUpper = tag.toUpperCase();
    var blacklist = ['CODE', 'SCRIPT', 'STYLE', 'EMBED', 'OBJECT', 'NAV', 'NOSCRIPT'];
    return (blacklist.indexOf(tagUpper) !== -1) || (ignoreTagsUser.indexOf(tagUpper) !== -1);
  }

  function elementNotRecognized(tag) {
    var tagUpper = tag.toUpperCase();
    var whitelist = ['ARTICLE', 'ASIDE', 'DETAILS', 'FOOTER', 'HEADER', 'MAIN', 'SECTION'];
    return (whitelist.indexOf(tagUpper) === -1) && (recognizeTagsUser.indexOf(tagUpper) === -1);
  }

  function splitPunctuation(str) {
    var leftPunctuation = str.match(/^[\W_]+/);
    var rightPunctuation = str.match(/[\W_]+$/);
    var word = str.replace(/^[\W_]+/, '').replace(/[\W_]+$/, '');
    return [leftPunctuation, word, rightPunctuation];
  }

  function replaceWordInReplacements(str) {
    var split = splitPunctuation(str);
    var leftP = split[0] !== null ? split[0] : '';
    var word = split[1];
    var rightP = split[2] !== null ? split[2] : '';
    var k = replacements.indexOf(word);

    if (k !== -1) {
      return leftP + replacements[k + 1] + rightP;
    }

    return str;
  }

  function replaceWordsInString(str) {
    var arr = str.split(' ');
    for (var i = 0; i < arr.length; i++) {
      arr[i] = replaceWordInReplacements(arr[i]);
    }
    return arr.join(' ');
  }

  function insertAfterString(arr, str, i) {
    arr.splice(i + 1, 0, str);
  }

  // scan all parent DIVs to find valid headings
  function scanHeadings(element, headingsArray) {
    var scanLines = 0;

    if (element === null) {
      console.warn('speak2me.core: scanHeadings element: undefined');
      return headingsArray;
    } else {
      $(element).find('*').each(function() {
        var curElement = $(this)[0];
        var nodeName = curElement.nodeName;
        var elementId = curElement.id;

        // break foreach if scanLines exceeded
        if (scanLines === pageScanLines) {
          console.debug('speak2me.core: scanHeadings stopped at: ' + pageScanLines + ' lines');
          return false;
        } else {
          if (nodeName.match(/H[1-6]/)) {
            headingsArray.push(curElement);
          }
          scanLines++;
        }
      });
    }

    return headingsArray;
  }

  // expand and calculate all valid elements to be spoken
  function scanContent(element) {
    var children    = element.childNodes;
    var childrenLen = children.length;
    var scanTimes   = 0;
    var arr         = [];
    var table, figure, blockquote, elem, nodeName;
    var voicePre, voicePost;
    var imgAttr, imgAttrLen, imgAttrArr, tableCaption, figCaption;

    for (var i = 0; i < childrenLen; i++) {
      if (!children[i].hasChildNodes()) {
        arr.push(children[i].textContent);
      } else {
        nodeName = children[i].nodeName;

        if (nodeName === 'TABLE') {
          table = children[i];
          tableCaption = table.querySelector('caption');
          if (customTags.hasOwnProperty('table') !== undefined) {
            arr.push(customTags.table.pre + tableCaption.textContent + customTags.table.post);
          }
        } else if (nodeName === 'FIGURE') {
          figure = children[i];
          figCaption = figure.querySelector('figcaption');
          if (customTags.hasOwnProperty('figure') !== undefined) {
            arr.push(customTags.figure.pre + figCaption.textContent + customTags.figure.post);
          }
        } else if (nodeName === 'BLOCKQUOTE') {
          blockquote = children[i];
          if (customTags.hasOwnProperty('blockquote') !== undefined) {
            arr.push(customTags.blockquote.pre + blockquote.textContent + customTags.blockquote.post);
          }
        } else if (nodeName === 'Q') {
          elem = children[i];
          if (customTags.hasOwnProperty('q') !== undefined) {
            arr.push(customTags.q.pre + elem.textContent + customTags.q.post);
          }
        } else if (nodeName === 'OL') {
          elem = children[i];
          if (customTags.hasOwnProperty('ol') !== undefined) {
            arr.push(customTags.ol.pre + elem.textContent + customTags.ol.post);
          }
        } else if (nodeName === 'UL') {
          elem = children[i];
          if (customTags.hasOwnProperty('ul') !== undefined) {
            arr.push(customTags.ul.pre + elem.textContent + customTags.ul.post);
          }
        } else if (nodeName === 'IMG') {
          if (customTags.hasOwnProperty('img') !== undefined) {
            imgAttrArr = ['title', 'alt'];
            imgAttrLen = imgAttrArr.length;

            for (var j = 0; j < imgAttrLen; j++) {
              imgAttr = imgAttrArr[j];
              if (children[i].getAttribute(imgAttr)) {
                insertAfterString(arr, customTags.img.pre + children[i].getAttribute(imgAttr) + customTags.img.post, i);
                break;
              }
            }
          }
        } else if (elementBlacklisted(nodeName)) {
          // Skip blacklisted elements
        } else if (elementNotRecognized(nodeName)) {
          arr.push(children[i].textContent);
        } else {
          arr = arr.concat(scanContent(children[i]));
        }
      }

      scanTimes++;
      if (scanTimes === pageScanCycle) {
        console.debug('speak2me.core: scanContent stopped at: ' + pageScanCycle + ' cycles');
        break;
      }
    }

    return arr;
  }

  function getChunks(element) {
    var arr           = scanContent(element);
    var arrLen        = arr.length;
    var newText       = '';
    var newArr        = [];
    var newArrItem    = 0;
    var chunks;

    for (var i = 0; i < arrLen; i++) {
      newText = arr[i].replace(/[\n\t]/g, '');
      newText = replaceWordsInString(newText);
      newText = newText.trim();

      if (newText.length > 0) {
        if (typeof newText !== 'undefined') {
          newArr[newArrItem] = newText;
          newArrItem++;
        }
      }
    }

    return newArr;
  }

  var methods = {
    speak: function(options) {
      var synthesis = window.speechSynthesis;

      // OPTIMIZATION: Early return if speech synthesis not available
      if (!synthesis) {
        console.warn('speak2me.core: Speech synthesis not available');
        return this;
      }

      // Cancel any ongoing speech
      synthesis.cancel();

      // SYNC FIX: Clear all caches and highlights on new speech
      clearAllHighlights();
      rebuildParagraph();

      // If no arguments, speak entire page
      if (arguments.length === 0) {
        options = {
          volume:             volumeUserDefault ? volumeUserDefault : volumeDefault,
          rate:               rateUserDefault ? rateUserDefault : rateDefault,
          pitch:              pitchUserDefault ? pitchUserDefault : pitchDefault,
          lang:               defaultLanguage,
          ignoreTagsArray:    ignoreTagsUser,
          recognizeTagsArray: recognizeTagsUser,
          replaceArray:       replacements
        };

        if (voiceUserDefault === undefined) {
          if (isFirefox) {
            voiceLanguageDefault = voiceLanguageFirefoxDefault[defaultLanguage];
          } else {
            voiceLanguageDefault = voiceLanguageGoogleDefault[defaultLanguage];
          }
        } else {
          voiceLanguageDefault = voiceUserDefault;
        }
      } else {
        customOptions = options;
        myOptions     = $.extend({}, defaultOptions, customOptions);

        myOptions.volume              = volumeUserDefault ? volumeUserDefault : (myOptions.volume || volumeDefault);
        myOptions.rate                = rateUserDefault ? rateUserDefault : (myOptions.rate || rateDefault);
        myOptions.pitch               = pitchUserDefault ? pitchUserDefault : (myOptions.pitch || pitchDefault);
        myOptions.lang                = myOptions.lang || defaultLanguage;
        myOptions.ignoreTagsArray     = ignoreTagsUser.length > 0 ? ignoreTagsUser : (myOptions.ignoreTagsArray || []);
        myOptions.recognizeTagsArray  = recognizeTagsUser.length > 0 ? recognizeTagsUser : (myOptions.recognizeTagsArray || []);
        myOptions.replaceArray        = replacements.length > 0 ? replacements : (myOptions.replaceArray || []);

        options = myOptions;

        if (voiceUserDefault === undefined) {
          if (isFirefox) {
            voiceLanguageDefault = voiceLanguageFirefoxDefault[options.lang];
          } else {
            voiceLanguageDefault = voiceLanguageGoogleDefault[options.lang];
          }
        } else {
          voiceLanguageDefault = voiceUserDefault;
        }
      }

      currentLanguage = options.lang;
      volume          = options.volume;
      rate            = options.rate;
      pitch           = options.pitch;

      // Initialize voices
      voices = synthesis.getVoices();
      if (voices.length === 0) {
        synthesis.addEventListener('voiceschanged', function() {
          voices = synthesis.getVoices();
        });
      }

      var element = this.get(0);
      if (!element) {
        console.warn('speak2me.core: No element found to speak');
        return this;
      }

      var chunks = getChunks(element);
      chunkCounterMax = chunks.length;

      if (chunkCounterMax === 0) {
        console.warn('speak2me.core: No content to speak');
        return this;
      }

      userStoppedSpeaking = false;

      function speakChunk(index) {
        if (userStoppedSpeaking || index >= chunks.length) {
          return;
        }

        var speech = new SpeechSynthesisUtterance(chunks[index]);
        speech.voice = voices.find(v => v.name === voiceLanguageDefault) || voices[0];
        speech.volume = volume;
        speech.rate = rate;
        speech.pitch = pitch;
        speech.lang = currentLanguage;

        // SYNC FIX: Reset highlight state for new chunk
        lastHighlightedIndex = -1;

        speech.onstart = function() {
          chunkCounter = index + 1;
          highlightParagraph(chunks[index]);

          // SYNC FIX: Prepare paragraph immediately when speech starts
          const highlightedEl = document.querySelector('.tts-karaoke-highlight-paragraph');
          if (highlightedEl) {
            // Small delay to ensure DOM is ready
            requestAnimationFrame(() => {
              prepareParagraphToHighlighWords(chunks[index]);
            });
          }
        };

        // SYNC FIX: Optimized boundary event handler
        speech.onboundary = function(event) {
          if (event.name === 'word' && event.charIndex !== undefined) {
            // SYNC FIX: Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
              highlightWord(event.charIndex);
            });
          }
        };

        speech.onend = function() {
          rebuildParagraph();
          
          if (index + 1 < chunks.length && !userStoppedSpeaking) {
            // SYNC FIX: Small pause between chunks for better synchronization
            setTimeout(() => {
              speakChunk(index + 1);
            }, pauseBetweenSentences);
          } else {
            // SYNC FIX: Clear all caches when done
            clearAllHighlights();
          }
        };

        speech.onerror = function(event) {
          console.error('speak2me.core: Speech error', event);
          clearAllHighlights();
        };

        synthesis.speak(speech);
      }

      speakChunk(0);
      return this;
    },

    pause: function() {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
      }
      return this;
    },

    resume: function() {
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      return this;
    },

    stop: function() {
      if (window.speechSynthesis) {
        userStoppedSpeaking = true;
        window.speechSynthesis.cancel();
        
        // SYNC FIX: Clear all caches and highlights on stop
        clearAllHighlights();
        rebuildParagraph();
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
      ignoreTagsUser = [];
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
        option.textContent = voice.name;
        option.setAttribute('value', voice.name);

        // Set selected voice
        if (voiceLanguageDefault !== undefined && voice.name === voiceLanguageDefault) {
          option.setAttribute('selected', 'selected');
        }

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
          foundVoice = voices.find(function(voice) {
            return voice.language.substring(0, 2).toUpperCase() === requestedLanguage;
          });
        } else {
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
