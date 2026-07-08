/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/speak2me.7.js
 # speak2me v.1.7 implementation (based on Articulate.js) for J1 Theme
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
 # - Claude: Paragraph highlighting fixes - Enhanced paragraph tracking and highlighting
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

  const defaultOptions       = require('./default-options.js');
  const ParseContent         = require('./parse-content.js');
  const parseContent         = ParseContent(defaultOptions);

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

  // var pause_spoken       = ' — ';
  var pause_spoken          = '';

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
        var score = lengthScore * 0.7 + positionScore * 0.3;
        
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatch = $elem;
        }
      }
    });

    return bestMatch;
  }

  // Claude: Paragraph highlighting fixes - Build paragraph cache for faster lookups
  function buildParagraphCache() {
    paragraphCache.clear();
    var $contentCached = getCachedContent();
    
    $contentCached.find('p, h1, h2, h3, h4, h5, h6, li, dt, dd').each(function() {
      var $elem = $(this);
      var speak2meId = $elem.attr('data-speak2me-id');
      
      if (speak2meId) {
        // Store both the element and its normalized text
        paragraphCache.set(speak2meId, {
          element: $elem,
          normalizedText: normalizeText($elem.text()),
          offsetTop: Math.round($elem.offset().top)
        });
      }
    });
  }

  // Claude: Paragraph highlighting fixes - Enhanced paragraph lookup
  function findParagraphForChunk(chunk) {
    // Method 1: Try cached paragraph by ID (fastest and most reliable)
    if (chunk.speak2meId && paragraphCache.has(chunk.speak2meId)) {
      var cached = paragraphCache.get(chunk.speak2meId);
      // Verify the element still exists in DOM
      if (cached.element && cached.element.length > 0 && $.contains(document.documentElement, cached.element[0])) {
        return cached.element;
      }
    }
    
    // Method 2: Try stored paragraph reference
    if (chunk.$paragraph && chunk.$paragraph.length > 0 && $.contains(document.documentElement, chunk.$paragraph[0])) {
      return chunk.$paragraph;
    }
    
    // Method 3: Try text matching with the section text
    if (chunk.sectionText) {
      var $found = findParagraphByText(chunk.sectionText, getCachedContent());
      if ($found && $found.length > 0) {
        return $found;
      }
    }
    
    // Method 4: Try text matching with first part of chunk text
    if (chunk.text && chunk.text.length > 20) {
      var searchText = chunk.text.substring(0, 50).replace(/\s+/g, ' ').trim();
      var $found = findParagraphByText(searchText, getCachedContent());
      if ($found && $found.length > 0) {
        return $found;
      }
    }
    
    return null;
  }

  // Claude: Paragraph highlighting fixes - Centralized highlight management
  function setHighlight($element) {
    // Remove previous highlight
    if (currentHighlightedElement) {
      currentHighlightedElement.removeClass('speak-highlighted');
    }
    
    // Add new highlight
    if ($element && $element.length > 0) {
      $element.addClass('speak-highlighted');
      currentHighlightedElement = $element;
      
      // Scroll to element with better error handling
      try {
        var elementTop = $element.offset().top;
        var scrollTop = elementTop - scrollBlockOffset;
        
        // Only scroll if element is not already visible
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
        
        if (elementTop < viewportTop || elementTop > viewportBottom) {
          window.scrollTo({
            top: scrollTop,
            behavior: scrollBehavior
          });
        }
      } catch (e) {
        console.warn('speak2me: Could not scroll to highlighted element', e);
      }
      
      return true;
    }
    
    return false;
  }

  function setHighlightParagraph(elementid) {

    // get the element with data-speak2me-id like 'speak2me-p-0'
    var selector = `[data-speak2me-id="${elementid}"]`;
    const $element = document.querySelector(selector);

    // Remove previous highlight
    // if (currentHighlightedElement !== null && currentHighlightedElement !== elementid) {
    //   $element.classList.remove('speak-highlighted');
    // }

    // Add new highlight
    if ($element) {
      $element.classList.add('speak-highlighted');
      currentHighlightedElement = elementid;

      // Scroll to (highlighted) element with error handling
      try {
        var elementTop = $element.offsetTop;
        var scrollTop = elementTop - scrollBlockOffset;

        // Only scroll if element is not already visible
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();

        if (elementTop < viewportTop || elementTop > viewportBottom) {
          window.scrollTo({
            top: scrollTop,
            behavior: scrollBehavior
          });
        }
      } catch (e) {
        console.warn('speak2me:\n Could not scroll to highlighted element:', e);
      }
      return true;
    }
    return false;
  }

  // Claude: Paragraph highlighting fixes - Clear all highlights
  function clearAllHighlights() {
//     if (currentHighlightedElement) {
// //    currentHighlightedElement.removeClass('speak-highlighted');
//       currentHighlightedElement.classList.remove('speak-highlighted');
//       currentHighlightedElement = null;
//     }
    $('.speak-highlighted').removeClass('speak-highlighted');
  }

  function clearParagraphHighlight(element) {
    element.classList.remove('speak-highlighted');
  }

  // OPTIMIZATION: Improved scan function with better error handling
  function scanPage(options) {
    var line = options.startLine || 0;
    var lines;
    var scanCounter = 0;
    var maxScanIterations = 100; // STABILITY: Prevent infinite loops

    function scanSection() {
      // STABILITY: Add maximum iteration check
      if (scanCounter++ > maxScanIterations) {
        console.warn('speak2me: Page scan exceeded maximum iterations');
        finalizeScan();
        return;
      }

      // OPTIMIZATION: Calculate once per iteration
      lines = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      // OPTIMIZATION: Cache jQuery selector
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
      
      // Claude: Paragraph highlighting fixes - Assign IDs and build cache
      paragraphIdCounter = 0;
      getCachedContent().find('p, h1, h2, h3, h4, h5, h6, li, dt, dd').each(function() {
        var $elem = $(this);
        if (!$elem.attr('data-speak2me-id')) {
          $elem.attr('data-speak2me-id', 'speak2me-p-' + (paragraphIdCounter++));
        }
      });
      
      // Build the paragraph cache for fast lookups
      buildParagraphCache();
    }

    scanSection();
  }

  // merge (configuration) objects
  // OPTIMIZATION: Simplified and more efficient
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
  // OPTIMIZATION: More efficient word counting
  function wordCount(str) {
    if (!str || typeof str !== 'string') return 0; // STABILITY: Input validation
    var words = str.trim().split(/\s+/);
    return words.filter(word => word !== '').length;
  }

  // This populates the "voices" array with objects that represent the
  // available voices in the current browser.
  function populateVoiceList() {
    // OPTIMIZATION: Clear existing voices before repopulating
    voices = [];
    
    let systemVoicesText = 'systemVoices START - ';
    var systemVoices = speechSynthesis.getVoices();

    for (var i = 0; i < systemVoices.length; i++) {
      voices.push(new voiceObj(systemVoices[i].name, systemVoices[i].lang));
      
      // OPTIMIZATION: Use regex for language matching
      if (/^(en|de-DE|es-ES|pl|nl)/.test(systemVoices[i].lang)) {
        systemVoicesText += systemVoices[i].lang.toString();
        systemVoicesText += ' : ';
        systemVoicesText += systemVoices[i].name.toString();
        systemVoicesText += '\n';
      }
    }
    systemVoicesText += " - systemVoices END.";
  }

  populateVoiceList();

  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  // After checking for compatibility, define the utterance object
  if ('speechSynthesis' in window) {
    var speech = new SpeechSynthesisUtterance();
    window.speechSynthesis.cancel();
  }

  // OPTIMIZATION: Simplified language detection
  if (!currentTranslation) {
    currentLanguage = defaultLanguage;
  } else {
    var translation = currentTranslation.split('/');
    var langCode = translation[2];
    
    // OPTIMIZATION: Use object mapping for language codes
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
  // Public functions (methods)
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

      // STABILITY: Validate options
      if (!myOptions) {
        console.error('speak2me: Invalid options provided');
        return this;
      }

      // scan page to find correct positions for scrolling and highlighting
      if (!myOptions.isPaused) {
        scanPage({ startLine: 0 });
      } else {
        scanFinished = true;
        // Claude: Paragraph highlighting fixes - Also build cache when resuming
        paragraphIdCounter = 0;
        getCachedContent().find('p, h1, h2, h3, h4, h5, h6, li, dt, dd').each(function() {
          var $elem = $(this);
          if (!$elem.attr('data-speak2me-id')) {
            $elem.attr('data-speak2me-id', 'speak2me-p-' + (paragraphIdCounter++));
          }
        });
        buildParagraphCache();
      }

      // Default values for voice tags
      voiceTags['a']                    = new voiceTag('Link' + pause_spoken, '');
      voiceTags['q']                    = new voiceTag(pause_spoken, '');
      voiceTags['ol']                   = new voiceTag(pause_spoken, '');
      voiceTags['ul']                   = new voiceTag(pause_spoken, '');
      voiceTags['dl']                   = new voiceTag(pause_spoken, '');
      voiceTags['dt']                   = new voiceTag(pause_spoken, '');
      voiceTags['img']                  = new voiceTag('Image element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['table']                = new voiceTag('Table element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['card-header']          = new voiceTag(pause_spoken, '');
      voiceTags['.doc-example']         = new voiceTag('Example element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.admonitionblock']     = new voiceTag('Attention element ' + pause_spoken, pause_spoken);
      voiceTags['.listingblock']        = new voiceTag('Text element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.gist']                = new voiceTag('Gist element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.slider']              = new voiceTag('Slider element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.swiper-app']          = new voiceTag('Slider element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.modal']               = new voiceTag('Info element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.masonry']             = new voiceTag('Masonry element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.lightbox-block']      = new voiceTag('Lightbox element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.gallery']             = new voiceTag('Gallery element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.audioblock']          = new voiceTag('Audio element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.videoblock']          = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.videojs-player']      = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.youtube-player']      = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.dailymotion-player']  = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.vimeo-player']        = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.wistia-player']       = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['figure']               = new voiceTag('Figure element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['parallax-quoteblock']  = new voiceTag('', pause_spoken);
      voiceTags['blockquote']           = new voiceTag('', pause_spoken);
      voiceTags['quoteblock']           = new voiceTag('', pause_spoken);

      ignoreTags = ['audio','button','canvas','code','del', 'pre', 'dialog','embed','form','head','iframe','meter','nav','noscript','object','picture', 'script','select','style','textarea','video'];

      // STABILITY: Check if speech synthesis is already active
      if (window.speechSynthesis.speaking) {
        console.warn('speak2me: Speech synthesis already in progress');
        return this;
      }

      // top-level function to prepare the HTML content
      var processSpeech = setInterval(function () {
        if (scanFinished) {
          // OPTIMIZATION: Process all elements in one pass
          try {
            _this.each(function() {
              obj = $(this).clone();
              processed = processDOMelements(obj, voiceTags, ignoreTags);
              processed = $(processed).html();
              finished = cleanDOMelements(processed);
              toSpeak = finished;
            });
          } catch (error) {
            // STABILITY: Error handling for DOM processing
            console.error('speak2me: Error processing DOM elements', error);
            clearInterval(processSpeech);
            return;
          }

          // Set speech parameters
          rate = rateUserDefault !== undefined ? rateUserDefault : rateDefault;
          pitch = pitchUserDefault !== undefined ? pitchUserDefault : pitchDefault;
          volume = volumeUserDefault !== undefined ? volumeUserDefault : volumeDefault;

          // OPTIMIZATION: Remove old event listeners before adding new ones
          if (speech && activeEventListeners.start) {
            speech.removeEventListener('start', activeEventListeners.start);
            speech.removeEventListener('end', activeEventListeners.end);
            if (activeEventListeners.boundary) {
              speech.removeEventListener('boundary', activeEventListeners.boundary);
            }
          }

          // create and configure the utterance object
          speech = new SpeechSynthesisUtterance();
          speech.rate = rate;
          speech.pitch = pitch;
          speech.volume = volume;
          
          // STABILITY: Safe voice selection with fallback
          var availableVoices = speechSynthesis.getVoices();
          var selectedVoice = availableVoices.find(function(voice) {
            return voice.name === voiceLanguageDefault;
          });

          speech.voice = selectedVoice || availableVoices[0];
          speech.previousScrollPosition = 0;

          // OPTIMIZATION: Store event listeners for cleanup
          activeEventListeners.boundary = function(event) {
            if (event.name === 'word') {
              const startIndex = event.charIndex;
              const length = event.charLength;
              const targetText = event.target.text;
              const currentWord = targetText.substring(startIndex, startIndex + length);
              // Uncomment if highlighting is needed
              // highlightWord(startIndex);
            }
          };

          speech.addEventListener('boundary', activeEventListeners.boundary);

          speech.onstart = (event) => {
            const speak2meId = event.currentTarget.speak2meId;

            // pause speechSynthesis BEFORE highlightning the current paragraph
            // window.speechSynthesis.pause();

            if (speak2meId !== undefined) {
              setHighlightParagraph(speak2meId);
            }

            // resume speechSynthesis AFTER highlightning the current paragraph
            // window.speechSynthesis.resume();
          };

          speech.onend = (event) => {

            // try {
            //   const length = event.currentTarget.$paragraph.length;
            //   // Do something with length
            //   clearParagraphHighlight(event.currentTarget.$paragraph[0]);
            // } catch (error) {
            //   // do nothing
            //   bla = event.currentTargetevent.currentTarget;
            //   //console.error('Error accessing length:', error.message);
            //   // Handle the error appropriately
            // }

            if (event.currentTarget.$paragraph !== undefined) {
              // Remove highlight on current paragraph
              clearParagraphHighlight(event.currentTarget.$paragraph[0]);
            } else {
               // manage loose text ()
               var currentTargetText = event.currentTarget.text;
               console.error('Error accessing loose text:', currentTargetText);
            }

            // not used anymore
            // clearAllHighlights();

            // pause between sentences in a paragraph
            pauseOnSpeak(500);
          };

          processTextChunks(speech, toSpeak);
          clearInterval(processSpeech);
        }
      }, speechCycle);

      // create the chunks array from (speakable) text generated
      function splitTextIntoChunks(text) {
        var chunks = [];

        // OPTIMIZATION: Chain text cleanup operations
        text = text
          .replace(/^\s+>/gm, '')
          .replaceAll(/^Attention\s+element.*/g, '')
          .replaceAll('..', '.')
          .replace(/(\r\n|\n|\r)/gm, '')
          .replace(/\s+/gm, ' ');

        chunks = text.split('.');

        // OPTIMIZATION: Single pass cleanup with filter
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
            // Claude: Paragraph highlighting fixes - Enhanced paragraph matching
            $paragraph = findParagraphByText(sectionText, $contentCached);
            
            // Store comprehensive data for reliable lookup later
            if ($paragraph && $paragraph.length > 0) {
              offset = Math.round($paragraph.offset().top);
              speak2meId = $paragraph.attr('data-speak2me-id');
              
              // Claude: Paragraph highlighting fixes - Ensure ID exists
              if (!speak2meId) {
                speak2meId = 'speak2me-p-' + (paragraphIdCounter++);
                $paragraph.attr('data-speak2me-id', speak2meId);
                
                // Update cache with new ID
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
        headingsArray = parseContent.selectHeadings(
          defaultOptions.contentSelector,
          defaultOptions.headingSelector
        );

        // OPTIMIZATION: More efficient heading parsing
        if (headingsArray && headingsArray.length > 0) {
          chunkSet.forEach((chunk) => {
            if (chunk.offsetTop === undefined) {
              var cleanText = chunk.text.replace(/[.?!]/g, '').trim();
              var normalizedChunkText = normalizeText(cleanText);

              for (var node of headingsArray) {
                var innerText = node.innerText.replace(/[?!]/g, '') + pause_spoken;
                var normalizedNodeText = normalizeText(innerText);
                
                // Claude: Paragraph highlighting fixes - Better heading text comparison
                if (normalizedNodeText === normalizedChunkText || 
                    normalizedNodeText.indexOf(normalizedChunkText) !== -1 ||
                    normalizedChunkText.indexOf(normalizedNodeText) !== -1) {
                  var headline = $('#' + node.id);
                  if (headline.length > 0) {
                    chunk.offsetTop = Math.round(headline.offset().top);
                    chunk.speak2meId = headline.attr('data-speak2me-id');
                    
                    // Claude: Paragraph highlighting fixes - Ensure heading has ID
                    if (!chunk.speak2meId) {
                      chunk.speak2meId = 'speak2me-p-' + (paragraphIdCounter++);
                      headline.attr('data-speak2me-id', chunk.speak2meId);
                      
                      // Update cache
                      paragraphCache.set(chunk.speak2meId, {
                        element: headline,
                        normalizedText: normalizedNodeText,
                        offsetTop: chunk.offsetTop
                      });
                    }
                    
                    // Claude: Paragraph highlighting fixes - Update paragraph reference
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

      // process chunks (to speak) sequentially
      function processTextChunks(speaker, chunks) {
        const synth = window.speechSynthesis;

        // indicate active converter in the quicklinks bar
        $('.mdib-speaker').addClass('mdib-spin');

        // Claude: Paragraph highlighting fixes - Enhanced start event handler
        activeEventListeners.start = function(event) {
          // Clear any existing highlights
          // clearAllHighlights();

          // Handle scrolling for valid offsetTop positions
          if (speaker.offsetTop !== undefined) {
            // Skip scrolling if offsetTop position is LOWER than expected
            if (speaker.offsetTop >= speaker.previousScrollPosition) {
              window.scrollTo({
                top: speaker.offsetTop - scrollBlockOffset,
                behavior: scrollBehavior
              });
            }
          }

          // Claude: Paragraph highlighting fixes - Improved paragraph finding and highlighting
          // var $currentParagraph = findParagraphForChunk(speaker);
          
          // // Apply highlighting if we found a paragraph
          // if ($currentParagraph && $currentParagraph.length > 0) {
          //   var highlighted = setHighlight($currentParagraph);
            
          //   if (highlighted) {
          //     // Store reference for cleanup
          //     speaker.$currentHighlight = $currentParagraph;
          //   } else {
          //     console.warn('speak2me: Highlighting failed for chunk:', 
          //       speaker.sectionText || speaker.text?.substring(0, 50));
          //   }
          // } else {
          //   // Claude: Paragraph highlighting fixes - Better debugging info
          //   console.warn('speak2me: Could not find paragraph for chunk', {
          //     speak2meId: speaker.speak2meId,
          //     sectionText: speaker.sectionText,
          //     textPreview: speaker.text?.substring(0, 50),
          //     offsetTop: speaker.offsetTop
          //   });
          // }
        };

        // Claude: Paragraph highlighting fixes - Enhanced end event handler
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
            speaker.$currentHighlight.removeClass('speak-highlighted');
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
              speaker.$paragraph.removeClass('speak-highlighted');
            }

            // Claude: Paragraph highlighting fixes - Use centralized highlight clearing
            // clearAllHighlights();

            // remove speak indication
            $('.mdib-speaker').removeClass('mdib-spin');

            // OPTIMIZATION: Clean up event listeners when done
            if (speaker && activeEventListeners.start) {
              speaker.removeEventListener('start', activeEventListeners.start);
              speaker.removeEventListener('end', activeEventListeners.end);
              if (activeEventListeners.boundary) {
                speaker.removeEventListener('boundary', activeEventListeners.boundary);
              }
              activeEventListeners = { start: null, end: null, boundary: null };
            }

            clearInterval(speechMonitor);
          } else {
            if (!wasRunOnce && myOptions.isPaused) {
              chunkCounter = myOptions.lastChunk || 0; // STABILITY: Add fallback
              wasRunOnce = true;
            }

            // STABILITY: Validate chunk exists before accessing
            if (chunks[chunkCounter]) {
              speaker.text = chunks[chunkCounter].text;
              speaker.offsetTop = chunks[chunkCounter].offsetTop;
              speaker.$paragraph = chunks[chunkCounter].$paragraph;
              speaker.speak2meId = chunks[chunkCounter].speak2meId;
              speaker.sectionText = chunks[chunkCounter].sectionText;

              // speak current text line
              if (!chunkSpoken && synth) {
                synth.speak(speaker);
                chunkSpoken = true;
              }
            } else {
              console.warn('speak2me: Invalid chunk at index', chunkCounter);
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
          console.error('speak2me: Invalid DOM clone');
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

        // Add pause to heading and list elements
        clone.find('h1,h2,h3,h4,h5,h6,p,li').addBack('h1,h2,h3,h4,h5,h6,p,li').each(function() {
          var text = $(this)[0].innerText;
          text = text.replace(/\s+/g, ' ') + pause_spoken;
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
            title_element = prev !== undefined ? $(this).prev() : null;

            if (title_element) title_element.remove();

            prepend = voiceTags[voiceTag].prepend;
            appended = voiceTags[voiceTag].append;

            if (title !== undefined && title !== '') {
              if (prepend !== '') $('<div>' + prepend + ' with the title, ' + title + pause_spoken + '</div>').insertBefore(this);
              if (appended !== '') $('<div>' + appended + '</div>').insertBefore(this);
            } else {
              if (prepend !== '') $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
              if (appended !== '') $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
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

        // Process data-speak2me-spell
        clone.find('[data-speak2me-spell]').addBack('[data-speak2me-spell]').each(function() {
          copy = $(this).text();
          copy = copy.split('').join(' ');
          $(this).text(copy);
        });

        return clone;
      }

      // run final cleanups on all DOM elements processed
      function cleanDOMelements(final) {
        var start, ended, speak, part1, part2;

        // STABILITY: Validate input
        if (!final || typeof final !== 'string') {
          console.error('speak2me: Invalid input for cleanDOMelements');
          return [];
        }

        // Search for <speak2me> in comments
        while (final.indexOf('<!-- <speak2me>') !== -1) {
          start = final.indexOf('<!-- <speak2me>');
          ended = final.indexOf('</speak2me> -->', start);
          if (ended === -1) break;
          speak = final.substring(start + 17, ended);
          part1 = final.substring(0, start);
          part2 = final.substring(ended + 17);
          final = part1 + ' ' + speak + ' ' + part2;
        }

        // Strip out remaining comments
        final = final.replace(/<!--[\s\S]*?-->/g, '');

        // Strip out remaining HTML tags
        final = final.replace(/(<([^>]+)>)/ig, '');

        // OPTIMIZATION: Chain all replacement operations
        var replacementPairs = [
          [/"/g, ''],
          [/"/g, ''],
          [/"/g, ''],
//        [/:/g, '.'],
          [/\., /g, '. '],
          [/ , /g, ', '],
          [/\. \./g, ''],
          [/, \./g, ''],
          [/  ,  /g, ''],
          [/^$/g, '\n'],
          [/Attention element.*/g, ''],
          [/^\s+$/g, '\n'],
          [/\s+\.\s+/g, '\n'],
          [/\s+\.\s+$/g, '\n'],
          [/\.\./g, '.'],
          [/e\.g\./g, 'for example'],
          [/E\.g\./g, 'For example, '],
          [/etc\./g, 'and so on, '],
          [/z\. B\./g, 'zum Beispiel, '],
          [/[\!\?]/g, '. '],
          [/—/g, pause_spoken],
          [/–/g, pause_spoken],
          [/--/g, pause_spoken],
          [/\s+/g, ' '],
          [/^\s*(\b\w+\b)\s*$/gm, "$1. "],
          [/^\s*(\b\w+\b\s*[0-9]{4})$/gm, "$1. "]
        ];

        replacementPairs.forEach(function(pair) {
          final = final.replace(pair[0], pair[1]);
        });

        // Replace user-specified strings
        for (var i = 0; i < replacements.length; i += 2) {
          if (replacements[i] && replacements[i + 1]) {
            var old = replacements[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            var rep = replacements[i + 1] + ' ';
            var regexp = new RegExp(old, 'gi');
            final = final.replace(regexp, rep);
          }
        }

        // Decode HTML entities
        var txt = document.createElement('textarea');
        txt.innerHTML = final;
        final = txt.value;

        // split the final text into chunks (sentences)
        const textChunks = splitTextIntoChunks(final);
        chunkCounterMax = textChunks.length;

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
        
        // Claude: Paragraph highlighting fixes - Use centralized clearing
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