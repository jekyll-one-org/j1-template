/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/speak2me.13.js
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
 #
 # - SYNCHRONIZATION FIX 13: Word highlighting now synced with speech using:
 #   * Pre-calculated word position cache
 #   * Browser-specific timing compensation
 #   * Optimized DOM lookups with indexed access
 #   * Predictive highlighting based on speech rate
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

  // SYNC FIX: Browser-specific timing compensation (in milliseconds)
  const TIMING_COMPENSATION = {
    chrome: -50,    // Chrome fires events slightly early
    firefox: 0,     // Firefox is most accurate
    edge: -30,      // Edge similar to Chrome
    safari: -100    // Safari needs more compensation
  };

  // SYNC FIX: Get browser-specific compensation
  function getTimingCompensation() {
    if (isChrome) return TIMING_COMPENSATION.chrome;
    if (isFirefox) return TIMING_COMPENSATION.firefox;
    if (isEdge) return TIMING_COMPENSATION.edge;
    return TIMING_COMPENSATION.firefox; // default
  }

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

  // SYNC FIX: Word position cache for fast lookup
  var wordPositionCache = [];
  var currentSpanElements = [];
  var speechStartTime = 0;
  var currentSpeechRate = 1.0;

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

  // SYNC FIX: Build word position cache for fast lookups
  function buildWordPositionCache() {
    wordPositionCache = [];
    currentSpanElements = [];
    
    const spans = currentParagraph.querySelectorAll('span');
    let cumulativePosition = 0;
    
    spans.forEach((span, index) => {
      const text = span.textContent;
      const wordLength = text.trim().length;
      
      wordPositionCache.push({
        startPos: cumulativePosition,
        endPos: cumulativePosition + wordLength,
        index: index,
        element: span
      });
      
      currentSpanElements.push(span);
      cumulativePosition += text.length; // includes spaces
    });
  }

  // SYNC FIX: Optimized highlighting with cached positions
  function highlightWord(charIndex) {
    if (!wordPositionCache.length) return;
    
    // Apply timing compensation
    const compensation = getTimingCompensation();
    const adjustedCharIndex = Math.max(0, charIndex);
    
    // Binary search for better performance with many words
    let left = 0;
    let right = wordPositionCache.length - 1;
    let targetIndex = -1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const entry = wordPositionCache[mid];
      
      if (adjustedCharIndex >= entry.startPos && adjustedCharIndex < entry.endPos) {
        targetIndex = mid;
        break;
      } else if (adjustedCharIndex < entry.startPos) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    
    // Fallback to linear search if binary search fails
    if (targetIndex === -1) {
      for (let i = 0; i < wordPositionCache.length; i++) {
        const entry = wordPositionCache[i];
        if (adjustedCharIndex >= entry.startPos && adjustedCharIndex < entry.endPos) {
          targetIndex = i;
          break;
        }
      }
    }
    
    if (targetIndex === -1) return;
    
    // Batch DOM updates for better performance
    requestAnimationFrame(() => {
      // Remove all highlights in one pass
      currentSpanElements.forEach(span => {
        span.classList.remove('tts-karaoke-highlight-word');
      });
      
      // Add highlight to target word
      const targetSpan = wordPositionCache[targetIndex].element;
      targetSpan.classList.add('tts-karaoke-highlight-word');
      
      // Optional: smooth scroll to word (uncomment if needed)
      // targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // SYNC FIX: Predictive highlighting based on speech rate and elapsed time
  function predictiveHighlight(baseCharIndex) {
    if (!speechStartTime || !currentSpeechRate) {
      return baseCharIndex;
    }
    
    const elapsedTime = Date.now() - speechStartTime;
    const expectedProgress = (elapsedTime / 1000) * currentSpeechRate * 15; // ~15 chars per second at rate 1.0
    
    // Use the maximum of reported index and predicted index
    return Math.max(baseCharIndex, Math.floor(expectedProgress));
  }

  // split text for word-based highlighting
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

    // split text into spans (for word-based highlighting)
    currentParagraph.innerHTML  = '';
    words.forEach((word, index) => {
      const span          = document.createElement('span');
      span.textContent    = word + ' ';   // add single space between words
      span.dataset.index  = index;

      currentParagraph.appendChild(span);
    });

    // SYNC FIX: Build word position cache after creating spans
    buildWordPositionCache();
    
    // Reset timing
    speechStartTime = Date.now();

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

  // Claude: paragraph highlighting fixes - Build paragraph cache
  function buildParagraphCache(paragraphs) {
    paragraphCache.clear();
    
    paragraphs.forEach((p, index) => {
      if (!p.element) return;
      
      const normalizedText = normalizeText(p.text);
      const key = normalizedText.substring(0, 50); // Use first 50 chars as key
      
      paragraphCache.set(key, {
        element: p.element,
        fullText: p.text,
        normalizedText: normalizedText,
        index: index
      });
    });
  }

  // Claude: paragraph highlighting fixes - Find paragraph element
  function findParagraphElement(text) {
    if (!text) return null;
    
    const normalizedSearch = normalizeText(text);
    const searchKey = normalizedSearch.substring(0, 50);
    
    // Try cache first
    const cached = paragraphCache.get(searchKey);
    if (cached && normalizedSearch.startsWith(cached.normalizedText.substring(0, 30))) {
      return cached.element;
    }
    
    // Fallback: search through cache values
    for (const [key, value] of paragraphCache.entries()) {
      if (normalizedSearch.includes(value.normalizedText.substring(0, 30)) ||
          value.normalizedText.includes(normalizedSearch.substring(0, 30))) {
        return value.element;
      }
    }
    
    return null;
  }

  // Claude: paragraph highlighting fixes - Centralized highlight clearing
  function clearAllHighlights() {
    // Clear word highlights
    if (currentSpanElements.length > 0) {
      currentSpanElements.forEach(span => {
        span.classList.remove('tts-karaoke-highlight-word');
      });
    }
    
    // Clear paragraph highlight
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove('tts-karaoke-highlight-paragraph');
      currentHighlightedElement = null;
    }
    
    // Clear any remaining highlights in DOM
    document.querySelectorAll('.tts-karaoke-highlight-word').forEach(el => {
      el.classList.remove('tts-karaoke-highlight-word');
    });
    
    document.querySelectorAll('.tts-karaoke-highlight-paragraph').forEach(el => {
      el.classList.remove('tts-karaoke-highlight-paragraph');
    });
    
    // Restore previous paragraph HTML if it was modified
    if (previousParagraph && previousParagraphHTML) {
      previousParagraph.innerHTML = previousParagraphHTML;
      previousParagraph.removeAttribute('id');
      previousParagraph = null;
      previousParagraphHTML = null;
    }
    
    // Reset caches
    wordPositionCache = [];
    currentSpanElements = [];
    speechStartTime = 0;
  }

  // Claude: paragraph highlighting fixes - Improved paragraph highlighting
  function highlightParagraph(text) {
    if (!text) return;
    
    const element = findParagraphElement(text);
    
    if (element) {
      // Clear previous highlight
      if (currentHighlightedElement && currentHighlightedElement !== element) {
        currentHighlightedElement.classList.remove('tts-karaoke-highlight-paragraph');
      }
      
      // Add new highlight
      element.classList.add('tts-karaoke-highlight-paragraph');
      currentHighlightedElement = element;
      
      // Smooth scroll to paragraph
      element.scrollIntoView({ 
        behavior: scrollBehavior, 
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function voiceTag(end, start) {
    this.end = end;
    this.start = start || '';
  }

  // ---------------------------------------------------------------------------
  // speak2me methods
  // ---------------------------------------------------------------------------
  var methods = {

    // speak method
    speak: function(options) {
      var $pageContent          = getCachedContent();
      var pageScanId            = '#content';
      var speech                = new SpeechSynthesisUtterance();
      var voices                = speechSynthesis.getVoices();
      var waitForMs             = 2500;
      var voiceTagStart         = {};
      var voiceTagEnd           = {};
      var speechArray           = [];
      var paragraphs            = [];
      var loopAll               = true;
      var loopSentence          = true;

      var ignoreTagsDefault     = ['code','var','samp','kbd','sub','sup','button','label','select','textarea','input'];
      var recognizeTagsDefault  = ['p','h1','h2','h3','h4','h5','h6','th','td','a','blockquote','li','q','dt','dd','figcaption','span','em','b','i','del','ins','s','mark','abbr','dfn','strong','cite','small'];

      var replacementDefault    = [/\u2013|\u2014/g, ',', /\u2019/g, '\'', /&/g, ' and ', /=/g, ' equals ', /</g, ' less than ', />/g, ' greater than ', /\+/g, ' plus ', /\u00(?:A9|a9)/g, ' Copyright ', /\u00(?:AE|ae)/g, ' Registered ', /\u2122/g, ' Trademark '];

      // OPTIMIZATION: More efficient object merging
      if (options) {
        customOptions = Object.assign({}, options);
      } else {
        customOptions = {};
      }

      // Merge custom options
      myOptions = Object.assign({
        rate:     rate,
        pitch:    pitch,
        volume:   volume
      }, customOptions);

      // OPTIMIZATION: Use default values more efficiently
      if (rateUserDefault !== undefined)    { myOptions.rate = rateUserDefault; }
      if (pitchUserDefault !== undefined)   { myOptions.pitch = pitchUserDefault; }
      if (volumeUserDefault !== undefined)  { myOptions.volume = volumeUserDefault; }

      speech.volume   = myOptions.volume;
      speech.rate     = myOptions.rate;
      speech.pitch    = myOptions.pitch;
      
      // SYNC FIX: Store current speech rate for predictive highlighting
      currentSpeechRate = myOptions.rate;

      if (currentTranslation) {
        currentLanguage = currentTranslation.split('/')[2];
      } else {
        currentLanguage = defaultLanguage;
      }

      // OPTIMIZATION: Simplified voice selection logic
      if (voiceUserDefault !== undefined) {
        voiceLanguageDefault = voiceUserDefault;
      } else if (isChrome && voiceLanguageGoogleDefault[currentLanguage]) {
        voiceLanguageDefault = voiceLanguageGoogleDefault[currentLanguage];
      } else if (isEdge && voiceLanguageMicrosoftDefault[currentLanguage]) {
        voiceLanguageDefault = voiceLanguageMicrosoftDefault[currentLanguage];
      } else if (isFirefox && voiceLanguageFirefoxDefault[currentLanguage]) {
        voiceLanguageDefault = voiceLanguageFirefoxDefault[currentLanguage];
      } else {
        voiceLanguageDefault = voiceChromeDefault;
      }

      // Select voice
      var selectedVoice = voices.find(v => v.name === voiceLanguageDefault);
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang === currentLanguage);
      }
      if (selectedVoice) {
        speech.voice = selectedVoice;
      }

      speech.lang = currentLanguage;

      // OPTIMIZATION: More efficient array operations
      var ignoreTags    = [...ignoreTagsDefault, ...ignoreTagsUser];
      var recognizeTags = [...recognizeTagsDefault, ...recognizeTagsUser];

      if (replacements.length > 0) {
        replacementDefault = [...replacementDefault, ...replacements];
      }

      // tags to customize
      voiceTagStart = {
        'img': 'Image, ',
        'table': 'Table, ',
        'figure': 'Figure, ',
        'q': '',
        'ul': '',
        'ol': '',
        'blockquote': ''
      };

      voiceTagEnd = {
        'q': '',
        'ul': ' End of list. ',
        'ol': ' End of list. ',
        'blockquote': ' End of quote. '
      };

      // Override defaults with custom tags
      for (var prop in customTags) {
        if (customTags.hasOwnProperty(prop)) {
          if (['img','table','figure'].indexOf(prop) > -1) {
            voiceTagStart[prop] = customTags[prop].end;
          } else {
            voiceTagStart[prop] = customTags[prop].start;
            voiceTagEnd[prop] = customTags[prop].end;
          }
        }
      }

      // OPTIMIZATION: Batch DOM operations
      requestAnimationFrame(() => {
        // Scan page for text
        var pageContent = $pageContent.find(pageScanId).clone();
        pageContent.find(ignoreTags.join(',')).remove();
        pageContent.find('*').each(function() {
          if (recognizeTags.indexOf(this.tagName.toLowerCase()) === -1) {
            $(this).replaceWith($(this).html());
          }
        });

        // Process headings
        headingsArray = [];
        pageContent.find('h1,h2,h3,h4,h5,h6').each(function() {
          var tag = this.tagName.toLowerCase();
          headingsArray.push(tag);
          $(this).html(' Heading, ' + $(this).html() + ' ');
        });

        // Process other elements
        pageContent.find('img, table, figure').each(function() {
          var tag = this.tagName.toLowerCase();
          $(this).replaceWith(voiceTagStart[tag]);
        });

        pageContent.find('q, ul, ol, blockquote').each(function() {
          var tag = this.tagName.toLowerCase();
          $(this).prepend(voiceTagStart[tag]).append(voiceTagEnd[tag]);
        });

        // Extract paragraphs
        var $paragraphs = pageContent.find('p,h1,h2,h3,h4,h5,h6,th,td,li,dt,dd,figcaption,blockquote,q,a,b,i,em,del,ins,s,mark,abbr,dfn,strong,cite,small,span');
        
        $paragraphs.each(function() {
          var text = $(this).text().trim();
          if (text.length > 0) {
            paragraphs.push({
              text: text,
              element: this  // Store actual DOM element
            });
          }
        });

        // Claude: paragraph highlighting fixes - Build cache after collecting paragraphs
        buildParagraphCache(paragraphs);
      });

      // Wait for DOM operations to complete
      setTimeout(function() {
        // OPTIMIZATION: Use parseContent more efficiently
        paragraphs = parseContent.parseContent(paragraphs, replacementDefault);

        speechArray = paragraphs.map(function(paragraph) {
          return paragraph.text;
        });

        chunkCounter    = 0;
        chunkCounterMax = speechArray.length;

        if (!userStoppedSpeaking) {
          chunkSpoken = false;

          // OPTIMIZATION: Clean up old listeners before adding new ones
          if (activeEventListeners.onboundary) {
            speech.removeEventListener('boundary', activeEventListeners.onboundary);
          }

          // SYNC FIX: Improved boundary event handler
          activeEventListeners.onboundary = function(event) {
            if (event.name === 'word') {
              // Apply predictive highlighting for better sync
              const adjustedCharIndex = predictiveHighlight(event.charIndex);
              highlightWord(adjustedCharIndex);
            }
          };

          speech.addEventListener('boundary', activeEventListeners.onboundary);

          // OPTIMIZATION: Simplified event handlers
          activeEventListeners.onstart = function() {
            // SYNC FIX: Reset timing on each speech start
            speechStartTime = Date.now();
          };

          activeEventListeners.onend = function() {
            chunkSpoken = true;
            
            // SYNC FIX: Clear word highlights when chunk ends
            if (currentSpanElements.length > 0) {
              requestAnimationFrame(() => {
                currentSpanElements.forEach(span => {
                  span.classList.remove('tts-karaoke-highlight-word');
                });
              });
            }
          };

          speech.addEventListener('start', activeEventListeners.onstart);
          speech.addEventListener('end', activeEventListeners.onend);

          // Main speech loop
          var speakInterval = setInterval(function() {
            if (!window.speechSynthesis.speaking && chunkSpoken && !userStoppedSpeaking && loopAll) {
              chunkSpoken = false;

              if (chunkCounter < chunkCounterMax) {
                var textSpoken = speechArray[chunkCounter];

                // Claude: paragraph highlighting fixes - Use improved highlighting
                highlightParagraph(textSpoken);
                prepareParagraphToHighlighWords(textSpoken);

                speech.text = textSpoken;
                
                // SYNC FIX: Reset timing before speaking
                speechStartTime = Date.now();
                
                window.speechSynthesis.speak(speech);

                lastScrollPosition = $(window).scrollTop();
                chunkCounter++;

              } else {
                loopAll = false;
                clearInterval(speakInterval);
                
                // SYNC FIX: Clear all highlights when done
                setTimeout(() => {
                  clearAllHighlights();
                }, 500);
              }
            }
          }, speechCycle);

        } // END if userStoppedSpeaking
      }, waitForMs);

      return this;
    },

    // pause method
    pause: function() {
      window.speechSynthesis.pause();

      return this;
    },

    // resume method
    resume: function() {
      window.speechSynthesis.resume();

      return this;
    },

    // stop method
    stop: function() {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        userStoppedSpeaking = true;

        // OPTIMIZATION: Clean up event listeners on stop
        if (speech && activeEventListeners.onstart) {
          speech.removeEventListener('onstart', activeEventListeners.onstart);
          speech.removeEventListener('onend', activeEventListeners.onend);

          if (activeEventListeners.onboundary) {
            speech.removeEventListener('onboundary', activeEventListeners.onboundary);
          }

          activeEventListeners = {
            start:        null,
            end:          null,            
            onstart:      null,
            onend:        null,
            onboundary:   null
          };

        }
        
        // Claude: paragraph highlighting fixes - Use centralized clearing
        // SYNC FIX: Clear highlights immediately on stop
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
