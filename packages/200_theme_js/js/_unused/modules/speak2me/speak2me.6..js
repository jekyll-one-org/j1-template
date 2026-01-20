/*
# -----------------------------------------------------------------------------
# ~/assets/theme/j1/modules/speak2me/js/speak2me.6.js
# speak2me v.1.6 implementation (based on Articulate.js) for J1 Theme
#
# Product/Info:
#   https://jekyll.one
#   https://github.com/acoti/articulate.js/tree/master
#
# -----------------------------------------------------------------------------
*/

'use strict';

/* eslint no-extra-semi: "off" */
/* eslint no-useless-escape: "off" */
/* eslint no-undef: "off" */
/* eslint no-redeclare: "off" */
/* eslint no-unused-vars: "off" */
/* eslint indent: "off" */
/* eslint quotes: "off" */
/* eslint no-prototype-builtins: "off" */

/* global window */

(function($) {

  const defaultOptions = require('../default-options.js');
  const ParseContent   = require('../parse-content.js');
  const parseContent   = ParseContent(defaultOptions);

  const scrollBehavior       = 'smooth';
  const speechCycle          = 10;
  const speechMonitorCycle   = 10;
  const textSliceLength      = 30;
  const minWords             = 3;
  const pageScanCycle        = 1000;
  const pageScanLines        = 10000;

  const isFirefox = /Firefox/i.test(navigator.userAgent);
  const isEdge    = /Edg/i.test(navigator.userAgent);
  const chrome    = /chrome/i.test(navigator.userAgent);
  const isChrome  = ((chrome) && (!isEdge));

  const ignoreProvider  = 'Microsoft';
  const sourceLanguage  = document.getElementsByTagName('html')[0].getAttribute('lang');

  // OPTIMIZATION: Cache DOM elements to avoid repeated queries
  var $content = null; // Will be cached on first use
  var textDisplay;

  var voiceUserDefault   = 'Google UK English Female';
  var voiceChromeDefault = 'Google US English';

  var defaultLanguage      = '';
  var navigatorLanguage    = navigator.language || navigator.userLanguage;
  var currentTranslation   = getCookie('googtrans');
  var scrollBlockOffset    = 100;
  var customOptions        = {};
  var myOptions            = {};
  var ignoreTagsUser       = [];
  var recognizeTagsUser    = [];
  var replacements         = [];
  var customTags           = [];
  var voices               = [];
  var headingsArray        = [];

  var rateDefault   = 0.9;
  var pitchDefault  = 1;
  var volumeDefault = 0.9;

  var rate   = rateDefault;
  var pitch  = pitchDefault;
  var volume = volumeDefault;

  var pause_spoken = ' — ';

  var chunkCounter         = 0;
  var userStoppedSpeaking  = false;
  var chunkSpoken          = false;
  var lastScrollPosition   = false;

  var rateUserDefault;
  var pitchUserDefault;
  var volumeUserDefault;

  var currentLanguage;
  var voiceLanguageDefault;
  var chunkCounterMax;
  var user_session;
  var scanFinished;

  // OPTIMIZATION: Store active event listeners for cleanup
  var activeEventListeners = {
    start:    null,
    end:      null,
    boundary: null
  };

  // Perplexity: Paragraph highlighting fixes
  // FIX: Add counter for unique paragraph IDs
  var paragraphIdCounter = 0;

  // Perplexity: Paragraph highlighting fixes
  // Add paragraph mapping cache
  var paragraphCache = new Map();

  // Perplexity: Paragraph highlighting fixes
  // Track current highlighted element centrally
  var currentHighlightedElement = null;

  var voiceLanguageGoogleDefault = {
    'de-DE': 'Google Deutsch',
    'en-GB': 'Google UK English Female',
    'es-ES': 'Google español',
    'fr-FR': 'Google français',
    'it-IT': 'Google italiano'
  };

  var voiceLanguageMicrosoftDefault = {
    'en-GB': 'Microsoft Libby Online (Natural) - English (United Kingdom)',
    'es-ES': 'Microsoft Elvira Online (Natural) - Spanish (Spain)',
    'fr-FR': 'Microsoft Denise Online (Natural) - French (France)',
    'de-DE': 'Microsoft Katja Online (Natural) - German (Germany)',
    'it-IT': 'Microsoft Elsa Online (Natural) - Italian (Italy)'
  };

  var voiceLanguageFirefoxDefault = {
    'en-GB': 'Microsoft Hazel - English (United Kingdom)',
    'de-DE': 'Microsoft Katja - German (Germany)'
  };

  if (sourceLanguage === 'en') {
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

  // Perplexity: Paragraph highlighting fixes
  // toggle the speak ID 'speak_highlighted'
  function toggleSpeakId(paragraph) {
    if (!paragraph) return;
    if (paragraph.id === 'speak_highlighted') {
      paragraph.removeAttribute('id');
    } else {
      paragraph.id = 'speak_highlighted';
    }
  }

  // highlighting logic
  function highlightWord(charIndex) {
    const spans = document.querySelectorAll('#speak_highlighted span');
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

    // Perplexity: Paragraph highlighting fixes
    // Use class + ID in a robust way
    var el = document.querySelector('.speak-highlighted');
    if (!el) return;

    el.id = 'speak_highlighted';
    textDisplay = el;

    textDisplay.innerHTML = '';

    words.forEach((word, index) => {
      const span = document.createElement('span');
      // add single space between words
      span.textContent  = word + ' ';
      span.dataset.index = index;
      textDisplay.appendChild(span);
    });
  }

  // Perplexity: Paragraph highlighting fixes
  // Enhanced text normalization
  function normalizeText(text) {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/['"'\"`´]/g, '')
      .replace(/[—–-]+/g, '-')
      .replace(/[\.,!?;:]+/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .toLowerCase();
  }

  // Perplexity: Paragraph highlighting fixes
  // Improved text matching with fuzzy logic
  function findParagraphByText(searchText, $container) {
    if (!searchText || !$container) return null;

    var normalizedSearch = normalizeText(searchText);
    if (normalizedSearch.length < 3) return null; // Too short to match reliably

    var bestMatch      = null;
    var bestMatchScore = 0;

    $container.find('p, h1, h2, h3, h4, h5, h6, li, dt, dd').each(function() {
      var $elem    = $(this);
      var elemText = normalizeText($elem.text());

      // Skip empty elements
      if (elemText.length === 0) return;

      // Check for exact substring match
      var index = elemText.indexOf(normalizedSearch);
      if (index !== -1) {
        // Calculate match score (prefer exact matches and shorter elements)
        // Also prefer matches at the beginning of the text
        var lengthScore   = normalizedSearch.length / elemText.length;
        var positionScore = 1 - (index / elemText.length);
        var score         = lengthScore * 0.7 + positionScore * 0.3;

        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatch      = $elem;
        }
      }
    });

    return bestMatch;
  }

  // Perplexity: Paragraph highlighting fixes
  // Build paragraph cache for faster lookups
  function buildParagraphCache() {
    paragraphCache.clear();

    var $contentCached = getCachedContent();
    $contentCached.find('p, h1, h2, h3, h4, h5, h6, li, dt, dd').each(function() {
      var $elem       = $(this);
      var speak2meId  = $elem.attr('data-speak2me-id');

      if (speak2meId) {
        paragraphCache.set(speak2meId, {
          element:        $elem,
          normalizedText: normalizeText($elem.text()),
          offsetTop:      Math.round($elem.offset().top)
        });
      }
    });
  }

  // Perplexity: Paragraph highlighting fixes
  // Enhanced paragraph lookup
  function findParagraphForChunk(chunk) {
    if (!chunk) return null;

    // Method 1: Try cached paragraph by ID (fastest and most reliable)
    if (chunk.speak2meId && paragraphCache.has(chunk.speak2meId)) {
      var cached = paragraphCache.get(chunk.speak2meId);

      // Verify the element still exists in DOM
      if (cached.element && cached.element.length > 0 &&
          $.contains(document.documentElement, cached.element[0])) {
        return cached.element;
      }
    }

    // Method 2: Try stored paragraph reference
    if (chunk.$paragraph && chunk.$paragraph.length > 0 &&
        $.contains(document.documentElement, chunk.$paragraph[0])) {
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
      var $found2    = findParagraphByText(searchText, getCachedContent());
      if ($found2 && $found2.length > 0) {
        return $found2;
      }
    }

    return null;
  }

  // Perplexity: Paragraph highlighting fixes
  // Centralized highlight management
  function setHighlight($element) {
    // Remove previous highlight
    if (currentHighlightedElement) {
      currentHighlightedElement.removeClass('speak-highlighted');
      currentHighlightedElement = null;
    }

    // Add new highlight
    if ($element && $element.length > 0) {
      $element.addClass('speak-highlighted');
      currentHighlightedElement = $element;

      // Scroll to element
      try {
        var elementTop     = $element.offset().top;
        var scrollTop      = elementTop - scrollBlockOffset;
        var viewportTop    = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();

        if (elementTop < viewportTop || elementTop > viewportBottom) {
          window.scrollTo({
            top:      scrollTop,
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

  // Perplexity: Paragraph highlighting fixes
  // Clear all highlights
  function clearAllHighlights() {
    if (currentHighlightedElement) {
      currentHighlightedElement.removeClass('speak-highlighted');
      currentHighlightedElement = null;
    }
    $('.speak-highlighted').removeClass('speak-highlighted');
  }

  // OPTIMIZATION: Improved scan function with better error handling
  function scanPage(options) {
    var line              = options.startLine || 0;
    var lines;
    var scanCounter       = 0;
    var maxScanIterations = 100; // STABILITY: Prevent infinite loops

    function scanSection() {
      // STABILITY: Add maximum iteration check
      if (scanCounter++ > maxScanIterations) {
        console.warn('speak2me: Page scan exceeded maximum iterations');
        finalizeScan();
        return;
      }

      lines = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      var $contentEl = getCachedContent();
      $contentEl.css('opacity', '0.3');

      if (line < lines) {
        setTimeout(function() {
          line = line + pageScanLines;
          window.scrollTo({ top: line, behavior: 'smooth' });
          scanSection();
        }, pageScanCycle);
      } else {
        setTimeout(finalizeScan, pageScanCycle);
      }
    }

    function finalizeScan() {
      scanFinished = true;
      getCachedContent().css('opacity', '1');

      // Perplexity: Paragraph highlighting fixes
      // Assign IDs and build cache
      paragraphIdCounter = 0;
      getCachedContent().find('p, h1, h2, h3, h4, h5, h6, li, dt, dd').each(function() {
        var $elem      = $(this);
        var speak2meId = $elem.attr('data-speak2me-id');
        if (!speak2meId) {
          speak2meId = 'speak2me-p-' + (paragraphIdCounter++);
          $elem.attr('data-speak2me-id', speak2meId);
        }
      });

      buildParagraphCache();
    }

    scanSection();
  }

  // merge (configuration) objects
  function extend() {
    var target = {};
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i];
      if (source) {
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
    var ca     = document.cookie.split(';');
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
    this.append  = append;
  }

  function voiceObj(name, language) {
    this.name     = name;
    this.language = language;
  }

  // count the number of words in a string
  function wordCount(str) {
    if (!str || typeof str !== 'string') return 0;
    var words = str.trim().split(/\s+/);
    return words.filter(function(word) { return word !== ''; }).length;
  }

  // This populates the "voices" array with objects that represent the
  // available voices in the current browser.
  function populateVoiceList() {
    voices = [];
    var systemVoices     = speechSynthesis.getVoices();
    var systemVoicesText = 'systemVoices START - ';

    for (var i = 0; i < systemVoices.length; i++) {
      voices.push(new voiceObj(systemVoices[i].name, systemVoices[i].lang));

      if (/^(en|de-DE|es-ES|pl|nl)/.test(systemVoices[i].lang)) {
        systemVoicesText += systemVoices[i].lang.toString();
        systemVoicesText += ' : ';
        systemVoicesText += systemVoices[i].name.toString();
        systemVoicesText += '\n';
      }
    }

    systemVoicesText += ' - systemVoices END.';
  }

  populateVoiceList();
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  // After checking for compatibility, define the utterance object
  var speech = null;
  if ('speechSynthesis' in window) {
    speech = new SpeechSynthesisUtterance();
    window.speechSynthesis.cancel();
  }

  // Simplified language detection
  if (!currentTranslation) {
    currentLanguage = defaultLanguage;
  } else {
    var translation = currentTranslation.split('/');
    var langCode    = translation[2];

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

      scanFinished = false;
      myOptions    = extend(options, defaultOptions, customOptions || {});

      if (!myOptions) {
        console.error('speak2me: Invalid options provided');
        return this;
      }

      // scan page to find correct positions for scrolling and highlighting
      if (!myOptions.isPaused) {
        scanPage({ startLine: 0 });
      } else {
        scanFinished = true;

        // Perplexity: Paragraph highlighting fixes
        // Also build cache when resuming
        paragraphIdCounter = 0;
        getCachedContent().find('p, h1, h2, h3, h4, h5, h6, li, dt, dd').each(function() {
          var $elem      = $(this);
          var speak2meId = $elem.attr('data-speak2me-id');
          if (!speak2meId) {
            speak2meId = 'speak2me-p-' + (paragraphIdCounter++);
            $elem.attr('data-speak2me-id', speak2meId);
          }
        });
        buildParagraphCache();
      }

      // Default values for voice tags
      voiceTags['a']   = new voiceTag('Link' + pause_spoken, '');
      voiceTags['q']   = new voiceTag(pause_spoken, '');
      voiceTags['ol']  = new voiceTag(pause_spoken, '');
      voiceTags['ul']  = new voiceTag(pause_spoken, '');
      voiceTags['dl']  = new voiceTag(pause_spoken, '');
      voiceTags['dt']  = new voiceTag(pause_spoken, '');
      voiceTags['img'] = new voiceTag('Image element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['table'] = new voiceTag('Table element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['card-header']  = new voiceTag(pause_spoken, '');
      voiceTags['.doc-example'] = new voiceTag('Example element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.admonitionblock'] = new voiceTag('Attention element' + pause_spoken, pause_spoken);
      voiceTags['.listingblock']    = new voiceTag('Text element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.gist']            = new voiceTag('Gist element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.slider']          = new voiceTag('Slider element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.swiper-app']      = new voiceTag('Slider element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.modal']           = new voiceTag('Info element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.masonry']         = new voiceTag('Masonry element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.lightbox-block']  = new voiceTag('Lightbox element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.gallery']         = new voiceTag('Gallery element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.audioblock']      = new voiceTag('Audio element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.videoblock']      = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.videojs-player']  = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.youtube-player']  = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.dailymotion-player'] = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.vimeo-player']    = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.wistia-player']   = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['figure']           = new voiceTag('Figure element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['parallax-quoteblock'] = new voiceTag('', pause_spoken);
      voiceTags['blockquote']       = new voiceTag('', pause_spoken);
      voiceTags['quoteblock']       = new voiceTag('', pause_spoken);

      ignoreTags = [
        'audio','button','canvas','code','del','pre','dialog','embed','form',
        'head','iframe','meter','nav','noscript','object','picture','script',
        'select','style','textarea','video'
      ];

      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        console.warn('speak2me: Speech synthesis already in progress');
        return this;
      }

      var processSpeech = setInterval(function() {
        if (scanFinished) {
          try {
            _this.each(function() {
              obj       = $(this).clone();
              processed = processDOMelements(obj, voiceTags, ignoreTags);
              processed = $(processed).html();
              finished  = cleanDOMelements(processed);
              toSpeak   = finished;
            });
          } catch (error) {
            console.error('speak2me: Error processing DOM elements', error);
            clearInterval(processSpeech);
            return;
          }

          rate   = rateUserDefault   !== undefined ? rateUserDefault   : rateDefault;
          pitch  = pitchUserDefault  !== undefined ? pitchUserDefault  : pitchDefault;
          volume = volumeUserDefault !== undefined ? volumeUserDefault : volumeDefault;

          if (speech && activeEventListeners.start) {
            speech.removeEventListener('start',    activeEventListeners.start);
            speech.removeEventListener('end',      activeEventListeners.end);
            if (activeEventListeners.boundary) {
              speech.removeEventListener('boundary', activeEventListeners.boundary);
            }
          }

          speech = new SpeechSynthesisUtterance();
          speech.rate   = rate;
          speech.pitch  = pitch;
          speech.volume = volume;

          var availableVoices = speechSynthesis.getVoices();
          var selectedVoice   = availableVoices.find(function(voice) {
            return voice.name === voiceLanguageDefault;
          });
          speech.voice = selectedVoice || availableVoices[0];

          speech.previousScrollPosition = 0;

          // boundary event (word highlighting inside paragraph)
          activeEventListeners.boundary = function(event) {
            if (event.name === 'word') {
              const startIndex = event.charIndex;
              // If span-word highlighting for the paragraph is wanted:
              // highlightWord(startIndex);
            }
          };
          speech.addEventListener('boundary', activeEventListeners.boundary);

          processTextChunks(speech, toSpeak);
          clearInterval(processSpeech);
        }
      }, speechCycle);

      return speech;
    },

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

        if (speech && activeEventListeners.start) {
          speech.removeEventListener('start',    activeEventListeners.start);
          speech.removeEventListener('end',      activeEventListeners.end);
          if (activeEventListeners.boundary) {
            speech.removeEventListener('boundary', activeEventListeners.boundary);
          }
          activeEventListeners = { start: null, end: null, boundary: null };
        }

        // Perplexity: Paragraph highlighting fixes
        // Use centralized clearing
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
        rate            = rateDefault;
      }
      return this;
    },

    pitch: function() {
      var num = arguments[0];
      if (num >= 0.1 && num <= 2) {
        pitchUserDefault = num;
      } else if (num === undefined) {
        pitchUserDefault = undefined;
        pitch            = pitchDefault;
      }
      return this;
    },

    volume: function() {
      var num = arguments[0];
      if (num >= 0 && num <= 1) {
        volumeUserDefault = num;
      } else if (num === undefined) {
        volumeUserDefault = undefined;
        volume            = volumeDefault;
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
          console.warn('speak2me: When customizing, tag must be "img", "table", or "figure".');
          return this;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString());
      }

      if (len === 3) {
        if (['q','ol','ul','blockquote'].indexOf(arguments[0]) === -1) {
          console.warn('speak2me: When customizing, tag must be "q", "ol", "ul" or "blockquote".');
          return this;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString(), arguments[2].toString());
      }

      return this;
    },

    getVoices: function() {
      if (arguments.length === 0) {
        return voices;
      }

      var obj          = $(arguments[0]);
      var selectionTxt = arguments[1] !== undefined ? arguments[1] : 'Choose a voice';
      obj.append($('<select><option value="">' + selectionTxt + '</option></select>'));

      var skippedVoices = 0;
      voices.forEach(function(voice) {
        if ((isChrome && voice.name.includes(ignoreProvider)) ||
            (isEdge && !voice.name.includes('Natural'))) {
          skippedVoices++;
          return;
        }

        var option = document.createElement('option');
        option.textContent = voice.name + ' (' + voice.language + ')';
        option.setAttribute('value', voice.name);

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
        var foundVoice = voices.find(function(voice) {
          return voice.name === requestedVoice;
        });
        if (foundVoice) {
          voiceUserDefault = requestedVoice;
        }
      }

      if (arguments[0] === 'language') {
        requestedLanguage = arguments[1].toUpperCase();
        var foundVoice2;

        if (requestedLanguage.length === 2) {
          foundVoice2 = voices.find(function(voice) {
            return voice.language.substring(0, 2).toUpperCase() === requestedLanguage;
          });
        } else {
          foundVoice2 = voices.find(function(voice) {
            return voice.language === requestedLanguage;
          });
        }

        if (foundVoice2) {
          voiceUserDefault = foundVoice2.name;
        }
      }

      return this;
    }

  }; // END methods

  // Perplexity: Paragraph highlighting fixes
  // process chunks (to speak) sequentially
  function processTextChunks(speaker, text) {
    const synth = window.speechSynthesis;

    $('.mdib-speaker').addClass('mdib-spin');

    var chunks = splitTextIntoChunks(text);

    // store for end-of-speech checking
    chunkCounterMax = chunks.length;

    // START handler
    activeEventListeners.start = function() {
      // Clear any existing highlights when a new utterance starts
      clearAllHighlights();

      // Highlight and scroll to paragraph for current chunk
      var $currentParagraph = findParagraphForChunk(speaker);

      if ($currentParagraph && $currentParagraph.length > 0) {
        var highlighted = setHighlight($currentParagraph);
        if (highlighted) {
          speaker.$currentHighlight = $currentParagraph;
        } else {
          console.warn(
            'speak2me: Highlighting failed for chunk:',
            speaker.sectionText || (speaker.text ? speaker.text.substring(0, 50) : '')
          );
        }
      } else {
        console.warn('speak2me: Could not find paragraph for chunk', {
          speak2meId:  speaker.speak2meId,
          sectionText: speaker.sectionText,
          textPreview: speaker.text ? speaker.text.substring(0, 50) : '',
          offsetTop:   speaker.offsetTop
        });
      }

      // Scroll handling
      if (speaker.offsetTop !== undefined) {
        if (speaker.offsetTop >= speaker.previousScrollPosition) {
          window.scrollTo({
            top:      speaker.offsetTop - scrollBlockOffset,
            behavior: scrollBehavior
          });
        }
      }
    };

    // END handler
    activeEventListeners.end = function() {
      if (speaker.offsetTop !== undefined) {
        if (speaker.offsetTop >= speaker.previousScrollPosition) {
          speaker.previousScrollPosition = speaker.offsetTop;
        }
        lastScrollPosition = speaker.offsetTop - scrollBlockOffset;
      }

      // Remove highlighting for spoken paragraph
      if (speaker.$currentHighlight !== undefined) {
        speaker.$currentHighlight.removeClass('speak-highlighted');
        speaker.$currentHighlight = undefined;
      }

      chunkSpoken = false;
      chunkCounter++;
    };

    speaker.addEventListener('start', activeEventListeners.start);
    speaker.addEventListener('end',   activeEventListeners.end);

    var wasRunOnce   = false;
    var speechMonitor = setInterval(function() {

      if (chunkCounter >= chunkCounterMax || userStoppedSpeaking) {
        chunkCounter        = 0;
        userStoppedSpeaking = false;
        chunkSpoken         = false;

        if (speaker.$paragraph !== undefined) {
          speaker.$paragraph.removeClass('speak-highlighted');
        }

        // Perplexity: Paragraph highlighting fixes
        clearAllHighlights();

        $('.mdib-speaker').removeClass('mdib-spin');

        if (speaker && activeEventListeners.start) {
          speaker.removeEventListener('start',    activeEventListeners.start);
          speaker.removeEventListener('end',      activeEventListeners.end);
          if (activeEventListeners.boundary) {
            speaker.removeEventListener('boundary', activeEventListeners.boundary);
          }
          activeEventListeners = { start: null, end: null, boundary: null };
        }

        clearInterval(speechMonitor);
      } else {
        if (!wasRunOnce && myOptions.isPaused) {
          chunkCounter = myOptions.lastChunk || 0;
          wasRunOnce   = true;
        }

        if (chunks[chunkCounter]) {
          speaker.text        = chunks[chunkCounter].text;
          speaker.offsetTop   = chunks[chunkCounter].offsetTop;
          speaker.$paragraph  = chunks[chunkCounter].$paragraph;
          speaker.speak2meId  = chunks[chunkCounter].speak2meId;
          speaker.sectionText = chunks[chunkCounter].sectionText;

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

  // create the chunks array from (speakable) text generated
  function splitTextIntoChunks(text) {
    var chunks = [];

    text = text
      .replace(/^\s+>/gm, '')
      .replaceAll(' ..', '.')
      .replace(/(\r\n|\n|\r)/gm, '')
      .replace(/\s+/gm, ' ');

    chunks = text.split('.');

    chunks = chunks
      .map(function(chunk) {
        return chunk.replace(/^\s+/g, '').replaceAll('""', '');
      })
      .filter(function(chunk) {
        return chunk.length > 0;
      })
      .map(function(chunk) {
        return chunk + '. ';
      });

    var chunkSet        = [];
    var $contentCached  = getCachedContent();

    chunks.forEach(function(chunkText) {
      var text        = chunkText;
      var sectionText = textSlice(text, textSliceLength, minWords);
      var offset;
      var $paragraph;
      var speak2meId;

      if (sectionText) {
        // Perplexity: Paragraph highlighting fixes
        // Enhanced paragraph matching
        $paragraph = findParagraphByText(sectionText, $contentCached);

        if ($paragraph && $paragraph.length > 0) {
          offset     = Math.round($paragraph.offset().top);
          speak2meId = $paragraph.attr('data-speak2me-id');

          if (!speak2meId) {
            speak2meId = 'speak2me-p-' + (paragraphIdCounter++);
            $paragraph.attr('data-speak2me-id', speak2meId);
          }

          paragraphCache.set(speak2meId, {
            element:        $paragraph,
            normalizedText: normalizeText($paragraph.text()),
            offsetTop:      offset
          });
        }
      }

      chunkSet.push({
        text:        text,
        offsetTop:   offset,
        $paragraph:  $paragraph,
        speak2meId:  speak2meId,
        sectionText: sectionText
      });
    });

    headingsArray = parseContent.selectHeadings(
      defaultOptions.contentSelector,
      defaultOptions.headingSelector
    );

    if (headingsArray && headingsArray.length > 0) {
      chunkSet.forEach(function(chunk) {
        if (chunk.offsetTop === undefined) {
          var cleanText          = chunk.text.replace(/[.?!]/g, '').trim();
          var normalizedChunkText = normalizeText(cleanText);

          for (var i = 0; i < headingsArray.length; i++) {
            var node              = headingsArray[i];
            var innerText         = node.innerText.replace(/[?!]/g, '') + pause_spoken;
            var normalizedNodeText = normalizeText(innerText);

            if (normalizedNodeText === normalizedChunkText ||
                normalizedNodeText.indexOf(normalizedChunkText) !== -1 ||
                normalizedChunkText.indexOf(normalizedNodeText) !== -1) {
              var headline = $('#' + node.id);
              if (headline.length > 0) {
                chunk.offsetTop  = Math.round(headline.offset().top);
                chunk.speak2meId = headline.attr('data-speak2me-id');

                if (!chunk.speak2meId) {
                  chunk.speak2meId = 'speak2me-p-' + (paragraphIdCounter++);
                  headline.attr('data-speak2me-id', chunk.speak2meId);
                }

                paragraphCache.set(chunk.speak2meId, {
                  element:        headline,
                  normalizedText: normalizedNodeText,
                  offsetTop:      chunk.offsetTop
                });

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
    if (!text || typeof text !== 'string') return undefined;

    var startSubString = 0;
    var endSubString   = startSubString + sliceLength;
    var subText        = text.substr(startSubString, endSubString);
    var stringArray    = subText.split(/(\s+)/);

    stringArray.pop();
    stringArray.pop();

    subText = stringArray.join('').replaceAll('.', '');

    var words = wordCount(subText);
    if (words < wordsMin) {
      return undefined;
    }
    return subText;
  }

  // transform all configured DOM elements of a page
  function processDOMelements(clone, voiceTags, ignoreTags) {
    var copy, title, title_element, content_type, content_element, content, appended, prepend;

    if (!clone || !clone.length) {
      console.error('speak2me: Invalid DOM clone');
      return clone;
    }

    if (recognizeTagsUser.length > 0) {
      recognizeTagsUser.forEach(function(tag) {
        var index = ignoreTags.indexOf(tag);
        if (index > -1) {
          ignoreTags.splice(index, 1);
        }
      });
    }

    ignoreTags.forEach(function(tag) {
      clone.find(tag).addBack(tag).not('[data-speak2me-recognize]').html('');
    });

    if (ignoreTagsUser.length > 0) {
      ignoreTagsUser.forEach(function(tag) {
        clone.find(tag).addBack(tag).not('[data-speak2me-recognize]').html('');
      });
    }

    clone.find('[data-speak2me-ignore]').addBack('[data-speak2me-ignore]').html('');
    clone.find('.speak2me-ignore').addBack('.speak2me-ignore').html('');

    clone.find('[data-speak2me-prepend]').addBack('[data-speak2me-prepend]').each(function() {
      copy = $(this).data('speak2me-prepend');
      $(this).prepend(copy + ' ');
    });

    clone.find('[data-speak2me-append]').addBack('[data-speak2me-append]').each(function() {
      copy = $(this).data('speak2me-append');
      $(this).append(' ' + copy);
    });

    for (var tag in voiceTags) {
      if (voiceTags.hasOwnProperty(tag)) {
        clone.find(tag).each(function() {
          var tagToUse = customTags[tag] || voiceTags[tag];
          $(this).prepend(tagToUse.prepend + pause_spoken);
          $(this).append(tagToUse.append + pause_spoken);
        });
      }
    }

    clone.find('h1,h2,h3,h4,h5,h6,p,li').addBack('h1,h2,h3,h4,h5,h6,p,li').each(function() {
      var text = $(this)[0].innerText;
      text     = text.replace(/\s+/g, ' ') + pause_spoken;
      $(this)[0].innerText = text;
    });

    clone.find('br').each(function() {
      $(this).append(pause_spoken);
    });

    clone.find('figure').addBack('figure').each(function() {
      copy       = $(this).find('figcaption').html();
      prepend    = customTags['figure'] ? customTags['figure'].prepend : voiceTags['figure'].prepend;
      if (copy !== undefined && copy !== '') {
        $('<span>' + prepend + pause_spoken + copy + '</span>').insertBefore(this);
      }
      $(this).remove();
    });

    clone.find('img').addBack('img').each(function() {
      copy = $(this).attr('alt');
      var parent     = $(this).parent();
      var parentName = parent.get(0).tagName;
      prepend        = customTags['img'] ? customTags['img'].prepend : voiceTags['img'].prepend;

      if (copy !== undefined && copy !== '') {
        var insertTarget = parentName === 'PICTURE' ? parent : this;
        $('<span>' + prepend + pause_spoken + copy + pause_spoken + '</span>').insertBefore(insertTarget);
      }
      $(this).remove();
    });

    clone.find('a').addBack('a').each(function() {
      var anchor  = $(this);
      copy        = anchor[0].innerText;
      prepend     = voiceTags['a'].prepend;
      appended    = voiceTags['a'].append;
      $('<span>' + copy + '</span>').insertBefore(this);
      $('<span>' + appended + '</span>').insertBefore(this);
      $(this).remove();
    });

    function processBlock(selector, voiceTagKey, getContent) {
      clone.find(selector).addBack(selector).each(function() {
        var $el    = $(this);
        var result = getContent($el);
        prepend    = customTags[selector] ? customTags[selector].prepend : voiceTags[voiceTagKey].prepend;
        appended   = customTags[selector] ? customTags[selector].append  : voiceTags[voiceTagKey].append;

        if (result && result.content) {
          $('<span>' + prepend + result.prefix + result.content + '</span>').insertBefore(this);
          $('<span>' + appended + '</span>').insertBefore(this);
        } else {
          $('<span>' + prepend + pause_spoken + '</span>').insertBefore(this);
          $('<span>' + appended + pause_spoken + '</span>').insertBefore(this);
        }
        $(this).remove();
      });
    }

    processBlock('.admonitionblock', '.admonitionblock', function($el) {
      var content_type = $el[0].classList[1];
      var content      = $el.find('.content')[0] ? $el.find('.content')[0].innerText : '';
      return content ? { content: content, prefix: content_type + '. ' } : null;
    });

    processBlock('.parallax-quoteblock', 'quoteblock', function($el) {
      var content = $el.find('.quote-text')[0] ? $el.find('.quote-text')[0].innerText : '';
      return content ? { content: content + pause_spoken, prefix: pause_spoken } : null;
    });

    clone.find('.quoteblock').addBack('.quoteblock').each(function() {
      var $this          = $(this);
      var attribution    = $this.find('.attribution');
      content_element    = $this.find('blockquote');
      content            = (content_element[0] ? content_element[0].innerText : '') +
                           (attribution[0]     ? attribution[0].innerText     : '');
      prepend            = voiceTags['quoteblock'].prepend;
      appended           = voiceTags['quoteblock'].append;

      if (content !== undefined && content !== '') {
        $('<span>' + prepend + pause_spoken + content + '</span>').insertBefore(this);
        $('<span>' + appended + pause_spoken + '</span>').insertBefore(this);
      }
      $(this).remove();
    });

    clone.find('table').addBack('table').each(function() {
      copy     = $(this).find('caption').text();
      prepend  = voiceTags['table'].prepend;
      appended = voiceTags['table'].append;

      if (copy !== undefined && copy !== '') {
        $('<span>' + prepend + pause_spoken + copy + '</span>').insertBefore(this);
        $('<span>' + appended + pause_spoken + '</span>').insertBefore(this);
      } else {
        $('<span>' + prepend + pause_spoken + '</span>').insertBefore(this);
        $('<span>' + appended + pause_spoken + '</span>').insertBefore(this);
      }
      $(this).remove();
    });

    function processMediaBlock(selector, voiceTagKey) {
      clone.find(selector).addBack(selector).each(function() {
        var $el       = $(this);
        var titleText = $el.find('.title, .video-title').text();
        prepend       = voiceTags[voiceTagKey].prepend;
        appended      = voiceTags[voiceTagKey].append;

        if (titleText !== undefined && titleText !== '') {
          $('<span>' + prepend + 'with the title, ' + titleText + pause_spoken + '</span>').insertBefore(this);
          $('<span>' + appended + '</span>').insertBefore(this);
        } else {
          $('<span>' + prepend + '</span>').insertBefore(this);
          $('<span>' + appended + '</span>').insertBefore(this);
        }
        $(this).remove();
      });
    }

    processMediaBlock('.audioblock',       '.audioblock');
    processMediaBlock('.videoblock',       '.videoblock');
    processMediaBlock('.videojs-player',   '.videojs-player');
    processMediaBlock('.youtube-player',   '.youtube-player');
    processMediaBlock('.dailymotion-player', '.dailymotion-player');
    processMediaBlock('.vimeo-player',     '.vimeo-player');
    processMediaBlock('.wistia-player',    '.wistia-player');

    clone.find('.card-header').addBack('card-header').each(function() {
      title_element = $(this).find('.card-title');
      prepend       = voiceTags['card-header'].prepend;
      appended      = voiceTags['card-header'].append;
      title         = title_element.length ? title_element[0].innerText + pause_spoken : '';

      $('<span>' + prepend + pause_spoken + '</span>').insertBefore(this);
      $('<span>' + appended + pause_spoken + title + '</span>').insertBefore(this);
      title_element.remove();
    });

    clone.find('.doc-example').addBack('.doc-example').each(function() {
      prepend  = voiceTags['.doc-example'].prepend;
      appended = voiceTags['.doc-example'].append;

      $('<span>' + prepend + pause_spoken + '</span>').insertBefore(this);
      $('<span>' + appended + pause_spoken + '</span>').insertBefore(this);
      $(this).remove();
    });

    clone.find('.listingblock').addBack('.listingblock').each(function() {
      var $this = $(this);
      title_element = $this.find('.title');
      copy          = title_element.length ? title_element[0].innerText : '';
      prepend       = voiceTags['.listingblock'].prepend;
      appended      = voiceTags['.listingblock'].append;

      if (copy !== undefined && copy !== '') {
        $('<span>' + prepend + ' with the title,' + copy + pause_spoken + '</span>').insertBefore(this);
        $('<span>' + appended + '</span>').insertBefore(this);
      } else {
        $('<span>' + prepend + pause_spoken + '</span>').insertBefore(this);
        $('<span>' + appended + pause_spoken + '</span>').insertBefore(this);
      }
      $(this).remove();
    });

    function processTitledBlock(selector, voiceTagKey) {
      clone.find(selector).addBack(selector).each(function() {
        var prev      = $(this).prev()[0];
        title         = (prev !== undefined) ? prev.innerText : '';
        title_element = prev !== undefined ? $(this).prev() : null;
        if (title_element) title_element.remove();

        prepend  = voiceTags[voiceTagKey].prepend;
        appended = voiceTags[voiceTagKey].append;

        if (title !== undefined && title !== '') {
          if (prepend !== '') $('<span>' + prepend + ' with the title, ' + title + pause_spoken + '</span>').insertBefore(this);
          if (appended !== '') $('<span>' + appended + '</span>').insertBefore(this);
        } else {
          if (prepend !== '') $('<span>' + prepend + pause_spoken + '</span>').insertBefore(this);
          if (appended !== '') $('<span>' + appended + pause_spoken + '</span>').insertBefore(this);
        }
        $(this).remove();
      });
    }

    processTitledBlock('.gist',          '.gist');
    processTitledBlock('.masonry',       '.masonry');
    processTitledBlock('.slider',        '.slider');
    processTitledBlock('.gallery',       '.gallery');
    processTitledBlock('.swiper-app',    '.swiper-app');
    processTitledBlock('.lightbox-block','.lightbox-block');

    clone.find('.modal').addBack('.modal').remove();

    clone.find('[data-speak2me-swap]').addBack('[data-speak2me-swap]').each(function() {
      copy = $(this).data('speak2me-swap');
      $(this).text(copy);
    });

    clone.find('[data-speak2me-spell]').addBack('[data-speak2me-spell]').each(function() {
      copy = $(this).text();
      copy = copy.split('').join(' ');
      $(this).text(copy);
    });

    return clone;
  }

  // run final cleanups on all DOM elements processed
  function cleanDOMelements(final) {
    if (!final || typeof final !== 'string') {
      console.error('speak2me: Invalid input for cleanDOMelements');
      return [];
    }

    var start = 0, ended, speak, part1, part2;

    while ((start = final.indexOf('<!--speak:', start)) !== -1) {
      ended = final.indexOf(':speak-->', start);
      if (ended === -1) break;

      speak = final.substring(start + 11, ended);
      part1 = final.substring(0, start);
      part2 = final.substring(ended + 11);
      final = part1 + ' ' + speak + ' ' + part2;
    }

    final = final.replace(/<!--speak:(.*?)-->/g, '');

    final = final.replace(/(<([^>]+)>)/ig, '');

    var replacementPairs = [
      [/\"/g, ''],
      [/\"/g, ''],
      [/\"/g, ''],
      [/:/g, '.'],
      [/\. ,/g, '. '],
      [/, ,/g, ', '],
      [/\. \./g, ''],
      [/, \./g, ''],
      [/, ,/g, ''],
      [/^$/g, '\n'],
      [/^\s+$/g, '\n'],
      [/\s+\.?\s+/g, '\n'],
      [/\s+\.?\s+$/g, '\n'],
      [/\. \./g, '.'],
      [/e\.g\./g, 'for example'],
      [/E\.g\./g, 'For example, '],
      [/etc\./g, 'and so on, '],
      [/z\. B\./g, 'zum Beispiel, '],
      /[!\?]/g,
      [/—/g, pause_spoken],
      [/–/g, pause_spoken],
      [/--/g, pause_spoken],
      [/\s+/g, ' '],
      [/^\s*(\b\w+\b)\s*$/gm, '$1. '],
      [/^\s*(\b\w+\b\s*[0-9]{4})$/gm, '$1. ']
    ];

    replacementPairs.forEach(function(pair) {
      final = final.replace(pair[0], pair[1]);
    });

    for (var i = 0; i < replacements.length; i += 2) {
      if (replacements[i] && replacements[i + 1]) {
        var old   = replacements[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        var rep   = replacements[i + 1] + ' ';
        var regexp = new RegExp(old, 'gi');
        final      = final.replace(regexp, rep);
      }
    }

    var txt = document.createElement('textarea');
    txt.innerHTML = final;
    final         = txt.value;

    var textChunks = splitTextIntoChunks(final);
    return textChunks;
  }

  // main speak2me method wrapper
  $.fn.speak2me = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.speak.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.speak2me');
    }
  };

}(jQuery));
