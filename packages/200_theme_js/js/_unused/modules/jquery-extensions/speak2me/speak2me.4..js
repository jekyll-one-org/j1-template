/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/speak2me.4.js
 # speak2me v.1.4 implementation (based on Articulate.js) for J1 Theme
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
*/
'use strict';

/* eslint-disable */

(function($) {

  const defaultOptions = require('./default-options.js');
  const ParseContent = require('./parse-content.js');
  const parseContent = ParseContent(defaultOptions);

  // Constants
  const CONSTANTS = {
    SCROLL_BEHAVIOR: 'smooth',
    SPEECH_CYCLE: 10,
    SPEECH_MONITOR_CYCLE: 10,
    TEXT_SLICE_LENGTH: 30,
    MIN_WORDS: 3,
    PAGE_SCAN_CYCLE: 1000,
    PAGE_SCAN_LINES: 10000,
    SCROLL_BLOCK_OFFSET: 100,
    RATE_DEFAULT: 0.9,
    PITCH_DEFAULT: 1,
    VOLUME_DEFAULT: 0.9,
    PAUSE_SPOKEN: ' — ',
    IGNORE_PROVIDER: 'Microsoft'
  };

  // Browser Detection
  const BROWSER = {
    isFirefox: /Firefox/i.test(navigator.userAgent),
    isEdge: /Edg/i.test(navigator.userAgent),
    isChrome: (() => {
      const chrome = /chrome/i.test(navigator.userAgent);
      const isEdge = /Edg/i.test(navigator.userAgent);
      return chrome && !isEdge;
    })()
  };

  // Language Detection
  const LANGUAGE = (() => {
    const sourceLanguage = document.documentElement.getAttribute("lang") || 'en';
    const navigatorLanguage = navigator.language || navigator.userLanguage;
    const currentTranslation = getCookie('googtrans');
    
    let defaultLanguage = sourceLanguage === 'en' 
      ? 'en-GB' 
      : `${sourceLanguage}-${sourceLanguage.toUpperCase()}`;
    
    let currentLanguage = defaultLanguage;
    
    if (currentTranslation) {
      const translation = currentTranslation.split('/');
      const langCode = translation[2];
      
      const langMap = {
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
      
      currentLanguage = langMap[langCode] || `${langCode}-${langCode.toUpperCase()}`;
    }
    
    return {
      source: sourceLanguage,
      navigator: navigatorLanguage,
      default: defaultLanguage,
      current: currentLanguage
    };
  })();

  // Voice Defaults by Browser
  const VOICE_DEFAULTS = {
    google: {
      'de-DE': 'Google Deutsch',
      'en-GB': 'Google UK English Female',
      'es-ES': 'Google español',
      'fr-FR': 'Google français',
      'it-IT': 'Google italiano'
    },
    microsoft: {
      'en-GB': 'Microsoft Libby Online (Natural) - English (United Kingdom)',
      'es-ES': 'Microsoft Elvira Online (Natural) - Spanish (Spain)',
      'fr-FR': 'Microsoft Denise Online (Natural) - French (France)',
      'de-DE': 'Microsoft Katja Online (Natural) - German (Germany)',
      'it-IT': 'Microsoft Elsa Online (Natural) - Italian (Italy)'
    },
    firefox: {
      'en-GB': 'Microsoft Hazel - English (United Kingdom)',
      'de-DE': 'Microsoft Katja - German (Germany)'
    }
  };

  // Get default voice based on browser
  const getDefaultVoice = () => {
    if (BROWSER.isChrome) return VOICE_DEFAULTS.google[LANGUAGE.current];
    if (BROWSER.isEdge) return VOICE_DEFAULTS.microsoft[LANGUAGE.current];
    if (BROWSER.isFirefox) return VOICE_DEFAULTS.firefox[LANGUAGE.current];
    return null;
  };

  // State Management
  class SpeechState {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.chunkCounter = 0;
      this.userStopped = false;
      this.chunkSpoken = false;
      this.lastScrollPosition = 0;
      this.scanFinished = false;
      this.chunkCounterMax = 0;
      this.currentHighlight = null;
      this.speechMonitorInterval = null;
      this.processSpeechInterval = null;
      this.eventListeners = [];
    }
    
    cleanup() {
      // Clear intervals
      if (this.speechMonitorInterval) {
        clearInterval(this.speechMonitorInterval);
        this.speechMonitorInterval = null;
      }
      if (this.processSpeechInterval) {
        clearInterval(this.processSpeechInterval);
        this.processSpeechInterval = null;
      }
      
      // Remove event listeners
      this.eventListeners.forEach(({ target, event, handler }) => {
        if (target && target.removeEventListener) {
          target.removeEventListener(event, handler);
        }
      });
      this.eventListeners = [];
      
      // Remove highlights
      if (this.currentHighlight) {
        $(this.currentHighlight).removeClass('speak-highlighted');
        this.currentHighlight = null;
      }
    }
    
    addListener(target, event, handler) {
      this.eventListeners.push({ target, event, handler });
    }
  }

  // Global State
  const state = new SpeechState();
  const voices = [];
  const headingsArray = [];
  
  let customOptions = {};
  let myOptions = {};
  let ignoreTagsUser = [];
  let recognizeTagsUser = [];
  let replacements = [];
  let customTags = {};
  
  let rateUserDefault;
  let pitchUserDefault;
  let volumeUserDefault;
  let voiceUserDefault = 'Google UK English Female';
  let voiceLanguageDefault = getDefaultVoice();

  // Utility Functions
  function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return undefined;
  }

  function extend(...sources) {
    return Object.assign({}, ...sources);
  }

  function wordCount(str) {
    if (!str) return 0;
    return str.split(/\s+/).filter(word => word.length > 0).length;
  }

  function voiceTag(prepend, append) {
    this.prepend = prepend || '';
    this.append = append || '';
  }

  function voiceObj(name, language) {
    this.name = name;
    this.language = language;
  }

  // Voice Management
  function populateVoiceList() {
    try {
      if (!window.speechSynthesis) return;
      
      const systemVoices = window.speechSynthesis.getVoices();
      voices.length = 0;
      
      systemVoices.forEach(voice => {
        voices.push(new voiceObj(voice.name, voice.lang));
      });
    } catch (error) {
      console.error('speak2me: Error populating voice list', error);
    }
  }

  // Initialize voices
  populateVoiceList();
  if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  // Initialize speech synthesis
  if ('speechSynthesis' in window) {
    try {
      const speech = new SpeechSynthesisUtterance();
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error('speak2me: Error initializing speech synthesis', error);
    }
  }

  // Page Scanning
  function scanPage(options) {
    return new Promise((resolve) => {
      let line = options.startLine || 0;
      const $content = $('#content');
      
      $content.css('opacity', 0.3);
      
      function scanSection() {
        const maxHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        if (line < maxHeight && !state.userStopped) {
          line += CONSTANTS.PAGE_SCAN_LINES;
          window.scrollTo({ top: line, behavior: CONSTANTS.SCROLL_BEHAVIOR });
          setTimeout(scanSection, CONSTANTS.PAGE_SCAN_CYCLE);
        } else {
          $content.css('opacity', 1);
          state.scanFinished = true;
          resolve();
        }
      }
      
      scanSection();
    });
  }

  // Text Processing
  function textSlice(text, sliceLength, wordsMin) {
    if (!text) return undefined;
    
    const subText = text.substring(0, sliceLength);
    const words = subText.split(/\s+/).slice(0, -2).join(' ').replace(/\./g, '');
    
    return wordCount(words) >= wordsMin ? words : undefined;
  }

  function splitTextIntoChunks(text) {
    if (!text) return [];
    
    // Clean text
    text = text
      .replace(/^\s+>/gm, '')
      .replaceAll(' ..', '.')
      .replace(/(\r\n|\n|\r)/gm, '')
      .replace(/\s+/gm, ' ');
    
    let chunks = text.split('.').map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);
    
    // Build chunk objects
    const chunkSet = chunks.map(chunk => {
      const chunkText = chunk + '. ';
      const sectionText = textSlice(chunkText, CONSTANTS.TEXT_SLICE_LENGTH, CONSTANTS.MIN_WORDS);
      let $paragraph;
      let offset;
      
      if (sectionText) {
        const escapedText = sectionText.replace(/['"]/g, '\\$&');
        $paragraph = $('#content').find(`p:contains('${escapedText}')`).first();
        offset = $paragraph.length > 0 ? Math.round($paragraph[0].offsetTop) : undefined;
      }
      
      return {
        text: chunkText,
        offsetTop: offset,
        $paragraph: $paragraph
      };
    });
    
    // Parse headings for missing offsets
    const parsedHeadings = parseContent.selectHeadings(
      defaultOptions.contentSelector,
      defaultOptions.headingSelector
    );
    
    if (parsedHeadings) {
      chunkSet.forEach(chunk => {
        if (chunk.offsetTop === undefined) {
          const text = chunk.text.replace(/\. $/, '');
          
          for (const node of parsedHeadings) {
            const innerText = node.innerText.replace(/[?!]/g, '') + CONSTANTS.PAUSE_SPOKEN;
            
            if (innerText === text) {
              const $headline = $(`#${node.id}`);
              if ($headline.length > 0) {
                chunk.offsetTop = Math.round($headline.offset().top);
                break;
              }
            }
          }
        }
      });
    }
    
    return chunkSet;
  }

  // Speech Processing
  function processTextChunks(speaker, chunks) {
    const synth = window.speechSynthesis;
    if (!synth) return;
    
    $('.mdib-speaker').addClass('mdib-spin');
    
    // Start event handler
    const handleStart = () => {
      $('.speak-highlighted').removeClass('speak-highlighted');
      
      if (speaker.offsetTop !== undefined && speaker.offsetTop >= speaker.previousScrollPosition) {
        window.scrollTo({
          top: speaker.offsetTop - CONSTANTS.SCROLL_BLOCK_OFFSET,
          behavior: CONSTANTS.SCROLL_BEHAVIOR
        });
      }
      
      if (speaker.text && speaker.text.length > 0) {
        const sectionText = textSlice(speaker.text, CONSTANTS.TEXT_SLICE_LENGTH, CONSTANTS.MIN_WORDS);
        
        if (sectionText) {
          const escapedText = sectionText.replace(/['"]/g, '\\$&');
          const $currentParagraph = $('#content').find(`p:contains('${escapedText}')`).first();
          
          if ($currentParagraph.length > 0) {
            $currentParagraph.addClass('speak-highlighted');
            state.currentHighlight = $currentParagraph[0];
          }
        }
      }
    };
    
    // End event handler
    const handleEnd = () => {
      if (speaker.offsetTop !== undefined && speaker.offsetTop >= speaker.previousScrollPosition) {
        speaker.previousScrollPosition = speaker.offsetTop;
        state.lastScrollPosition = speaker.offsetTop - CONSTANTS.SCROLL_BLOCK_OFFSET;
      }
      
      if (state.currentHighlight) {
        $(state.currentHighlight).removeClass('speak-highlighted');
        state.currentHighlight = null;
      }
      
      state.chunkSpoken = false;
      state.chunkCounter++;
    };
    
    // Add event listeners
    speaker.addEventListener('start', handleStart);
    speaker.addEventListener('end', handleEnd);
    state.addListener(speaker, 'start', handleStart);
    state.addListener(speaker, 'end', handleEnd);
    
    // Speech monitor loop
    let wasRunOnce = false;
    state.speechMonitorInterval = setInterval(() => {
      if (state.chunkCounter >= state.chunkCounterMax || state.userStopped) {
        state.cleanup();
        $('.mdib-speaker').removeClass('mdib-spin');
        return;
      }
      
      if (!wasRunOnce && myOptions.isPaused) {
        state.chunkCounter = myOptions.lastChunk || 0;
        wasRunOnce = true;
      }
      
      const currentChunk = chunks[state.chunkCounter];
      if (!currentChunk) return;
      
      speaker.text = currentChunk.text;
      speaker.offsetTop = currentChunk.offsetTop;
      speaker.$paragraph = currentChunk.$paragraph;
      
      if (!state.chunkSpoken) {
        try {
          synth.speak(speaker);
          state.chunkSpoken = true;
        } catch (error) {
          console.error('speak2me: Error speaking chunk', error);
          state.chunkCounter++;
        }
      }
    }, CONSTANTS.SPEECH_MONITOR_CYCLE);
  }

  // DOM Processing
  function processDOMelements(clone) {
    if (!clone) return clone;
    
    const $clone = $(clone);
    
    // Define voice tags
    const voiceTags = {
      'a': new voiceTag('Link' + CONSTANTS.PAUSE_SPOKEN, ''),
      'q': new voiceTag(CONSTANTS.PAUSE_SPOKEN, ''),
      'ol': new voiceTag(CONSTANTS.PAUSE_SPOKEN, ''),
      'ul': new voiceTag(CONSTANTS.PAUSE_SPOKEN, ''),
      'dl': new voiceTag(CONSTANTS.PAUSE_SPOKEN, ''),
      'dt': new voiceTag(CONSTANTS.PAUSE_SPOKEN, ''),
      'img': new voiceTag('Image element' + CONSTANTS.PAUSE_SPOKEN, 'Element not spoken' + CONSTANTS.PAUSE_SPOKEN),
      'table': new voiceTag('Table element' + CONSTANTS.PAUSE_SPOKEN, 'Element not spoken' + CONSTANTS.PAUSE_SPOKEN),
      'figure': new voiceTag('Figure element' + CONSTANTS.PAUSE_SPOKEN, 'Element not spoken' + CONSTANTS.PAUSE_SPOKEN),
      'blockquote': new voiceTag('', CONSTANTS.PAUSE_SPOKEN)
    };
    
    const ignoreTags = ['audio', 'button', 'canvas', 'code', 'del', 'pre', 'dialog', 
                       'embed', 'form', 'head', 'iframe', 'meter', 'nav', 'noscript', 
                       'object', 'picture', 'script', 'select', 'style', 'textarea', 'video'];
    
    // Remove recognized tags
    if (recognizeTagsUser.length > 0) {
      recognizeTagsUser.forEach(tag => {
        const index = ignoreTags.indexOf(tag);
        if (index > -1) ignoreTags.splice(index, 1);
      });
    }
    
    // Remove ignored tags
    ignoreTags.forEach(tag => {
      $clone.find(tag).addBack(tag).not('[data-speak2me-recognize]').html('');
    });
    
    // Remove user-specified ignored tags
    ignoreTagsUser.forEach(tag => {
      $clone.find(tag).addBack(tag).not('[data-speak2me-recognize]').html('');
    });
    
    // Remove data-speak2me-ignore elements
    $clone.find('[data-speak2me-ignore], .speak2me-ignore').addBack('[data-speak2me-ignore], .speak2me-ignore').html('');
    
    // Process data-speak2me-prepend
    $clone.find('[data-speak2me-prepend]').addBack('[data-speak2me-prepend]').each(function() {
      const text = $(this).data('speak2me-prepend');
      if (text) $(this).prepend(text + ' ');
    });
    
    // Process data-speak2me-append
    $clone.find('[data-speak2me-append]').addBack('[data-speak2me-append]').each(function() {
      const text = $(this).data('speak2me-append');
      if (text) $(this).append(' ' + text);
    });
    
    // Add pauses to headings and list items
    $clone.find('h1,h2,h3,h4,h5,h6,p,li').addBack('h1,h2,h3,h4,h5,h6,p,li').each(function() {
      if (this.innerText) {
        this.innerText = this.innerText.replace(/\s+/g, ' ') + CONSTANTS.PAUSE_SPOKEN;
      }
    });
    
    // Add pauses to line breaks
    $clone.find('br').append(CONSTANTS.PAUSE_SPOKEN);
    
    // Process figures
    $clone.find('figure').addBack('figure').each(function() {
      const caption = $(this).find('figcaption').html();
      const prepend = (customTags['figure'] || voiceTags['figure']).prepend;
      
      if (caption) {
        $(`<div>${prepend}${CONSTANTS.PAUSE_SPOKEN}${caption}</div>`).insertBefore(this);
      }
      $(this).remove();
    });
    
    // Process images
    $clone.find('img').addBack('img').each(function() {
      const alt = $(this).attr('alt');
      const parent = $(this).parent();
      const prepend = (customTags['img'] || voiceTags['img']).prepend;
      
      if (alt) {
        const target = parent.get(0).tagName === 'PICTURE' ? parent : $(this);
        $(`<div>${prepend}${CONSTANTS.PAUSE_SPOKEN}${alt}${CONSTANTS.PAUSE_SPOKEN}</div>`).insertBefore(target);
      }
      $(this).remove();
    });
    
    // Process anchors
    $clone.find('a').addBack('a').each(function() {
      const text = this.innerText;
      if (text) {
        $(`<div>${text}</div>`).insertBefore(this);
      }
      $(this).remove();
    });
    
    // Process tables
    $clone.find('table').addBack('table').each(function() {
      const caption = $(this).find('caption').text();
      const prepend = voiceTags['table'].prepend;
      const append = voiceTags['table'].append;
      
      if (caption) {
        $(`<div>${prepend}${CONSTANTS.PAUSE_SPOKEN}${caption}</div>`).insertBefore(this);
      } else {
        $(`<div>${prepend}${CONSTANTS.PAUSE_SPOKEN}</div>`).insertBefore(this);
      }
      $(`<div>${append}${CONSTANTS.PAUSE_SPOKEN}</div>`).insertBefore(this);
      $(this).remove();
    });
    
    return clone;
  }

  function cleanDOMelements(html) {
    if (!html) return '';
    
    let final = html;
    
    // Extract speak2me comments
    while (final.indexOf('<!-- <speak2me>') !== -1) {
      const start = final.indexOf('<!-- <speak2me>');
      const end = final.indexOf('</speak2me> -->', start);
      if (end === -1) break;
      
      const speak = final.substring(start + 17, end);
      final = final.substring(0, start) + ' ' + speak + ' ' + final.substring(end + 17);
    }
    
    // Remove comments and HTML tags
    final = final.replace(/<!--[\s\S]*?-->/g, '').replace(/(<([^>]+)>)/ig, '');
    
    // Apply replacements
    for (let i = 0; i < replacements.length; i += 2) {
      const old = replacements[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const rep = replacements[i + 1] + ' ';
      final = final.replace(new RegExp(old, 'gi'), rep);
    }
    
    // Text cleanup
    final = final
      .replaceAll('"', '').replaceAll('"', '').replaceAll('"', '')
      .replaceAll(':', '.')
      .replaceAll('., ', '. ')
      .replaceAll(' , ', ', ')
      .replaceAll('. .', '')
      .replaceAll(', .', '')
      .replaceAll('  ,  ', '')
      .replace(/^$/g, '\n')
      .replace(/^\s+$/g, '\n')
      .replace(/\s+\.\s+/g, '\n')
      .replace(/\s+\.\s+$/g, '\n')
      .replace(/\.\./g, '.')
      .replaceAll('e.g.', 'for example')
      .replaceAll('E.g.', 'For example, ')
      .replaceAll('etc.', 'and so on, ')
      .replaceAll('z. B.', 'zum Beispiel, ')
      .replace(/[!?]/g, '. ')
      .replaceAll('—', CONSTANTS.PAUSE_SPOKEN)
      .replaceAll('–', CONSTANTS.PAUSE_SPOKEN)
      .replaceAll('--', CONSTANTS.PAUSE_SPOKEN);
    
    // Decode HTML entities
    const txt = document.createElement('textarea');
    txt.innerHTML = final;
    final = txt.value;
    
    // Final cleanup
    final = final
      .replace(/^\s*(\b\w+\b)\s*$/gm, '$1. ')
      .replace(/^\s*(\b\w+\b\s*[0-9]{4})$/gm, '$1. ')
      .replace(/\s+/g, ' ');
    
    return final;
  }

  // Public API Methods
  const methods = {
    speak: function(options) {
      if (!window.speechSynthesis) {
        console.error('speak2me: Speech synthesis not supported');
        return this;
      }
      
      if (window.speechSynthesis.speaking) {
        return this;
      }
      
      state.cleanup();
      state.reset();
      
      myOptions = extend(defaultOptions, customOptions, options);
      
      const _this = this;
      
      // Scan page if not paused
      const scanPromise = myOptions.isPaused 
        ? Promise.resolve() 
        : scanPage({ startLine: 0 });
      
      scanPromise.then(() => {
        state.scanFinished = true;
        
        state.processSpeechInterval = setInterval(() => {
          if (!state.scanFinished) return;
          
          let toSpeak = '';
          
          _this.each(function() {
            const obj = $(this).clone();
            const processed = processDOMelements(obj);
            const html = $(processed).html();
            const cleaned = cleanDOMelements(html);
            toSpeak = cleaned;
          });
          
          const rate = rateUserDefault !== undefined ? rateUserDefault : CONSTANTS.RATE_DEFAULT;
          const pitch = pitchUserDefault !== undefined ? pitchUserDefault : CONSTANTS.PITCH_DEFAULT;
          const volume = volumeUserDefault !== undefined ? volumeUserDefault : CONSTANTS.VOLUME_DEFAULT;
          
          const speech = new SpeechSynthesisUtterance();
          speech.rate = rate;
          speech.pitch = pitch;
          speech.volume = volume;
          speech.previousScrollPosition = 0;
          
          const selectedVoice = window.speechSynthesis.getVoices()
            .find(voice => voice.name === voiceLanguageDefault);
          
          if (selectedVoice) {
            speech.voice = selectedVoice;
          }
          
          const textChunks = splitTextIntoChunks(toSpeak);
          state.chunkCounterMax = textChunks.length;
          
          if (textChunks.length > 0) {
            processTextChunks(speech, textChunks);
          }
          
          clearInterval(state.processSpeechInterval);
          state.processSpeechInterval = null;
        }, CONSTANTS.SPEECH_CYCLE);
      });
      
      return this;
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
      }
      state.userStopped = true;
      state.cleanup();
      return this;
    },

    enabled: function() {
      return 'speechSynthesis' in window;
    },

    isSpeaking: function() {
      return window.speechSynthesis ? window.speechSynthesis.speaking : false;
    },

    isSpoken: function() {
      return window.speechSynthesis && window.speechSynthesis.speaking 
        ? state.chunkCounter 
        : false;
    },

    isScrolled: function() {
      return window.speechSynthesis && window.speechSynthesis.speaking 
        ? state.lastScrollPosition 
        : false;
    },

    isPaused: function() {
      return window.speechSynthesis ? window.speechSynthesis.paused : false;
    },

    rate: function(num) {
      if (num >= 0.1 && num <= 10) {
        rateUserDefault = num;
      } else if (num === undefined) {
        rateUserDefault = undefined;
      }
      return this;
    },

    pitch: function(num) {
      if (num >= 0.1 && num <= 2) {
        pitchUserDefault = num;
      } else if (num === undefined) {
        pitchUserDefault = undefined;
      }
      return this;
    },

    volume: function(num) {
      if (num >= 0 && num <= 1) {
        volumeUserDefault = num;
      } else if (num === undefined) {
        volumeUserDefault = undefined;
      }
      return this;
    },

    ignore: function(...tags) {
      ignoreTagsUser = tags;
      return this;
    },

    recognize: function(...tags) {
      recognizeTagsUser = tags;
      return this;
    },

    replace: function(...args) {
      replacements = args;
      return this;
    },

    customize: function(...args) {
      if (args.length === 0) {
        customTags = {};
      } else if (args.length === 2 && ['img', 'table', 'figure'].includes(args[0])) {
        customTags[args[0]] = new voiceTag(args[1]);
      } else if (args.length === 3 && ['q', 'ol', 'ul', 'blockquote'].includes(args[0])) {
        customTags[args[0]] = new voiceTag(args[1], args[2]);
      } else {
        console.warn('speak2me: Invalid customize parameters');
      }
      return this;
    },

    getVoices: function(selector, selectionText = 'Choose a voice') {
      if (!selector) return voices;
      
      const $obj = $(selector);
      $obj.append($(`<select id='voiceSelect' name='voiceSelect'><option value='none'>${selectionText}</option></select>`));
      
      let count = 0;
      voices.forEach(voice => {
        if (BROWSER.isChrome && voice.name.includes(CONSTANTS.IGNORE_PROVIDER)) return;
        if (BROWSER.isEdge && !voice.name.includes('Natural')) return;
        
        const $option = $('<option></option>')
          .text(`${voice.name} (${voice.language})`)
          .val(voice.name)
          .attr('data-speak2me-language', voice.language);
        
        if (voice.name === voiceLanguageDefault) {
          $option.attr('selected', 'selected');
        }
        
        $obj.find('select').append($option);
        count++;
      });
      
      return count;
    },

    setVoice: function(type, value) {
      if (!type || !value) return this;
      
      if (type === 'name') {
        const voice = voices.find(v => v.name === value);
        if (voice) voiceUserDefault = value;
      } else if (type === 'language') {
        const lang = value.toUpperCase();
        const voice = lang.length === 2
          ? voices.find(v => v.language.substring(0, 2).toUpperCase() === lang)
          : voices.find(v => v.language === lang);
        
        if (voice) voiceUserDefault = voice.name;
      }
      
      return this;
    }
  };

  // jQuery Plugin Registration
  $.fn.speak2me = function(method, ...args) {
    if (methods[method]) {
      return methods[method].apply(this, args);
    } else if (typeof method === 'object' || !method) {
      return methods.speak.apply(this, arguments);
    } else {
      $.error(`Method ${method} does not exist on $.speak2me`);
      return this;
    }
  };

})(jQuery);