/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/speak2me.js
 # speak2me v.1.0 implementation (based on Articulate.js) for J1 Theme
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

/* Articulate.js (1.1.0). (C) 2017 Adam Coti.
  MIT @license: en.wikipedia.org/wiki/MIT_License
  See Github page at: https://github.com/acoti/articulate.js
  See Web site at: https://purefreedom.com/articulate/
*/

/* Further reading
  https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353
  https://github.com/jankapunkt/easy-speech
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
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

  // Karaoke highlighting state
  var currentParagraphElement = null;
  var currentWordSpans = [];
  var originalParagraphHTML = '';

  var voiceUserDefault      = 'Google UK English Female';
  var voiceChromeDefault    = 'Google US English';
  var defaultLanguage       = '';
  var navigatorLanguage     = navigator.language || navigator.userLanguage;

  var currentTranslation    = getCookie('googtrans');
  var scrollBlockOffset     = 100;

  var customOptions         = {};
  var myOptions             = {};

  var ignoreTagsUser        = new Array();
  var recognizeTagsUser     = new Array();
  var replacements          = new Array();
  var customTags            = new Array();
  var voices                = new Array();
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

  // Prepare paragraph for word-by-word highlighting
  function prepareParagraphForKaraoke($paragraph, text) {
    if (!$paragraph || !$paragraph.length) return;

    // Store original HTML and element
    currentParagraphElement = $paragraph[0];
    originalParagraphHTML = $paragraph.html();

    // Split text into words and wrap each in a span
    const words = text.trim().split(/\s+/);
    const wrappedHTML = words.map((word, index) => {
      return `<span class="speak2me-word" data-word-index="${index}">${word}</span>`;
    }).join(' ');

    $paragraph.html(wrappedHTML);
    
    // Store references to all word spans
    currentWordSpans = $paragraph.find('.speak2me-word').toArray();
  }

  // Highlight word at character position (Karaoke effect)
  function highlightWordAtPosition(charIndex) {
    if (!currentWordSpans.length) return;

    let currentPos = 0;
    let foundWord = false;

    // Remove all existing word highlights
    currentWordSpans.forEach(span => {
      span.classList.remove('speak2me-word-highlight');
    });

    // Find and highlight the current word
    for (let i = 0; i < currentWordSpans.length; i++) {
      const span = currentWordSpans[i];
      const wordLength = span.textContent.length;

      // Account for spaces between words
      if (charIndex >= currentPos && charIndex < currentPos + wordLength) {
        span.classList.add('speak2me-word-highlight');
        
        // Scroll to keep highlighted word visible
        span.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        foundWord = true;
        break;
      }
      
      // Add 1 for the space after the word
      currentPos += wordLength + 1;
    }
  }

  // Clean up paragraph highlighting
  function cleanupParagraphHighlight() {
    if (currentParagraphElement && originalParagraphHTML) {
      // Remove word highlights
      currentWordSpans.forEach(span => {
        span.classList.remove('speak2me-word-highlight');
      });
      
      // Restore original HTML
      $(currentParagraphElement).html(originalParagraphHTML);
      
      // Remove paragraph highlight
      $(currentParagraphElement).removeClass('speak2me-paragraph-highlight');
    }
    
    currentParagraphElement = null;
    currentWordSpans = [];
    originalParagraphHTML = '';
  }

  // scan a page to get correct positions for scrolling and highlighting
  function scanPage(options) {
    var line = options.startLine;
    var lines;

    function scanSection(counter) {
      lines = Math.max (
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      $('#content').attr("style", "opacity: .3");

      if (line < lines) {
        setTimeout(function() {
          counter++;
          line = line + pageScanLines;
          window.scrollTo({top: line, behavior: 'smooth'});
          scanSection(counter);
        }, pageScanCycle);
      } else {
        setTimeout(function() {
          scanFinished = true;
          $('#content').attr("style", "opacity: 1");
        }, pageScanCycle);
      }
    }
    scanSection({
      startLine: 0
    });
  }

  // merge (configuration) objects
  function extend () {
    var target = {};
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
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
        var value = c.substring(nameEQ.length, c.length);
        return value;
      }
    }
    return undefined;
  }

  function voiceTag(prepend,append) {
    this.prepend = prepend;
    this.append = append;
  }

  function voiceObj(name,language) {
    this.name = name;
    this.language = language;
  }

  // count the number of words in a string
  function wordCount(str) {
    var count = 0;
    var words = str.split(" ");
    for (var i = 0; i < words.length; i++) {
      if (words[i] != "") {
        count += 1;
      }
    }
    return (count);
  }

  // This populates the "voices" array with objects that represent the
  // available voices in the current browser.
  function populateVoiceList() {
    let systemVoicesText  = 'systemVoices START - ';
    var systemVoices      = speechSynthesis.getVoices();

    for (var i = 0; i < systemVoices.length; i++) {
      voices.push(new voiceObj(systemVoices[i].name, systemVoices[i].lang));
      if ( systemVoices[i].lang.includes("en") || systemVoices[i].lang.includes("de-DE") || systemVoices[i].lang.includes("es-ES") || systemVoices[i].lang.includes("pl") || systemVoices[i].lang.includes("nl") ) {
        systemVoicesText += systemVoices[i].lang.toString();
        systemVoicesText += ' : ';
        systemVoicesText += systemVoices[i].name.toString();
        systemVoicesText += '\n';
      }
    }
    systemVoicesText     += " - systemVoices END.";
  }

  populateVoiceList();

  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  if ('speechSynthesis' in window) {
    var speech = new SpeechSynthesisUtterance();
    window.speechSynthesis.cancel();
  }

  if ( currentTranslation === undefined ) {
    currentLanguage = defaultLanguage;
  } else {
    var translation = currentTranslation.split('/');
    if ( translation[2] == 'en') {
      currentLanguage = 'en-GB';
    } else if ( translation[2].includes('ar') ) {
      currentLanguage = 'ar-EG';
    } else if ( translation[2].includes('cs') ) {
      currentLanguage = 'cs-CZ';
    } else if ( translation[2].includes('da') ) {
      currentLanguage = 'da-DK';
    } else if ( translation[2].includes('en') ) {
      currentLanguage = 'en-UK';
    } else if ( translation[2].includes('et') ) {
      currentLanguage = 'et-EE';
    } else if ( translation[2].includes('ka') ) {
      currentLanguage = 'ka-GE';
    } else if ( translation[2].includes('el') ) {
      currentLanguage = 'el-GR';
    } else if ( translation[2].includes('iw') ) {
      currentLanguage = 'he-IL';
    } else if ( translation[2].includes('hi') ) {
      currentLanguage = 'hi-IN';
    } else if ( translation[2].includes('ja') ) {
      currentLanguage = 'ja-JP';
    } else if ( translation[2].includes('zh') ) {
      currentLanguage = 'zh-CN';
    } else {
      currentLanguage = translation[2] + '-' + translation[2].toUpperCase();
    }
  }

  if (isChrome) {
    var voiceLanguageDefault = voiceLanguageGoogleDefault[currentLanguage];
  }

  if (isEdge) {
    var voiceLanguageDefault = voiceLanguageMicrosoftDefault[currentLanguage];
  }

  if (isFirefox) {
    var voiceLanguageDefault = voiceLanguageFirefoxDefault[currentLanguage];
  }

  // ---------------------------------------------------------------------------
  // Public functions (methods)
  // ---------------------------------------------------------------------------
  var methods = {

    // main speak2me method.
    speak: function(options) {
        var toSpeak   = '';
        var voiceTags = new Array();
        var _this     = this;
        var obj, processed, finished;
        var ignoreTags;

        scanFinished  = false;
        myOptions     = extend(options, defaultOptions, customOptions || {});

        // scan page to find correct positions for scrolling and highlighting
        if (!myOptions.isPaused) {
          scanPage({
            startLine: 0
          });
        } else {
          scanFinished = true;
        }

        // Default values
        voiceTags['a']                    = new voiceTag('Link' + pause_spoken,              '');
        voiceTags['q']                    = new voiceTag(pause_spoken,                       '');
        voiceTags['ol']                   = new voiceTag(pause_spoken,                       '');
        voiceTags['ul']                   = new voiceTag(pause_spoken,                       '');
        voiceTags['dl']                   = new voiceTag(pause_spoken,                       '');
        voiceTags['dt']                   = new voiceTag(pause_spoken,                       '');
        voiceTags['img']                  = new voiceTag('Image element' + pause_spoken,     'Element not spoken' + pause_spoken);
        voiceTags['table']                = new voiceTag('Table element' + pause_spoken,     'Element not spoken' + pause_spoken);
        voiceTags['card-header']          = new voiceTag(pause_spoken,                       '');
        voiceTags['.doc-example']         = new voiceTag('Example element' + pause_spoken,   'Element not spoken' + pause_spoken);
        voiceTags['.admonitionblock']     = new voiceTag('Attention element' + pause_spoken, pause_spoken);
        voiceTags['.listingblock']        = new voiceTag('Text element' + pause_spoken,      'Element not spoken' + pause_spoken);
        voiceTags['.gist']                = new voiceTag('Gist element' + pause_spoken,      'Element not spoken' + pause_spoken);
        voiceTags['.slider']              = new voiceTag('Slider element' + pause_spoken,    'Element not spoken' + pause_spoken);
        voiceTags['.swiper-app']          = new voiceTag('Slider element' + pause_spoken,    'Element not spoken' + pause_spoken);
        voiceTags['.modal']               = new voiceTag('Info element' + pause_spoken,      'Element not spoken' + pause_spoken);
        voiceTags['.masonry']             = new voiceTag('Masonry element' + pause_spoken,   'Element not spoken' + pause_spoken);
        voiceTags['.lightbox-block']      = new voiceTag('Lightbox element' + pause_spoken,  'Element not spoken' + pause_spoken);
        voiceTags['.gallery']             = new voiceTag('Gallery element' + pause_spoken,   'Element not spoken' + pause_spoken);
        voiceTags['.audioblock']          = new voiceTag('Audio element' + pause_spoken,     'Element not spoken' + pause_spoken);
        voiceTags['.videoblock']          = new voiceTag('Video element' + pause_spoken,     'Element not spoken' + pause_spoken);
        voiceTags['.videojs-player']      = new voiceTag('Video element' + pause_spoken,     'Element not spoken' + pause_spoken);
        voiceTags['.youtube-player']      = new voiceTag('Video element' + pause_spoken,     'Element not spoken' + pause_spoken);
        voiceTags['.dailymotion-player']  = new voiceTag('Video element' + pause_spoken,     'Element not spoken' + pause_spoken);
        voiceTags['.vimeo-player']        = new voiceTag('Video element' + pause_spoken,     'Element not spoken' + pause_spoken);
        voiceTags['.wistia-player']       = new voiceTag('Video element' + pause_spoken,     'Element not spoken' + pause_spoken);
        voiceTags['figure']               = new voiceTag('Figure element' + pause_spoken,    'Element not spoken' + pause_spoken);
        voiceTags['parallax-quoteblock']  = new voiceTag('',                                  pause_spoken);
        voiceTags['blockquote']           = new voiceTag('',                                  pause_spoken);
        voiceTags['quoteblock']           = new voiceTag('',                                  pause_spoken);

        ignoreTags = ['audio','button','canvas','code','del', 'pre', 'dialog','embed','form','head','iframe','meter','nav','noscript','object','picture', 'script','select','style','textarea','video'];

        if (window.speechSynthesis.speaking) {
            return;
        };

        // top-level function to prepare the HTML content of a page
        // and transform the resulting (speakable) text into chunks
        var processSpeech = setInterval(function () {
          if (scanFinished) {
            _this.each(function() {
                obj = $(this).clone();
                processed = processDOMelements(obj);
                processed = $(processed).html();
                finished = cleanDOMelements(processed);
                toSpeak = finished;
            });

            // Check if users have set their own rate/pitch/volume defaults
            if (rateUserDefault !== undefined) {
                rate = rateUserDefault;
            } else {
                rate = rateDefault;
            }
            if (pitchUserDefault !== undefined) {
                pitch = pitchUserDefault;
            } else {
                pitch = pitchDefault;
            }
            if (volumeUserDefault !== undefined) {
                volume = volumeUserDefault;
            } else {
                volume = volumeDefault;
            }

            // create and configure the utterance object
            speech                        = new SpeechSynthesisUtterance();
            speech.rate                   = rate;
            speech.pitch                  = pitch;
            speech.volume                 = volume;
            speech.voice                  = speechSynthesis.getVoices().filter(function(voice) {return voice.name == voiceLanguageDefault;})[0];
            speech.previousScrollPosition = 0;

            // Speech synthesis utterance boundary events for word highlighting
            speech.onboundary = function(event) {
                if (event.name === 'word') {
                    highlightWordAtPosition(event.charIndex);
                }
            };

            processTextChunks(speech, toSpeak);
            clearInterval(processSpeech);
          }
        }, speechCycle);

        // create the chunks array from (speakable) text generated
        function splitTextIntoChunks(text) {
          var chunks = [];

          // strip strange elements from text
          text = text.replace(/^\s+>/gm, '');
          text = text.replaceAll(' ..', '.');

          // cleanup text
          text = text.replace(/(\r\n|\n|\r)/gm, '');
          text = text.replace(/\s+/gm, ' ');

          chunks = text.split('.');

          // 1st cleanup of chunks
          chunks.forEach((chunk, index) => {
            chunks[index] = chunks[index].replace(/^\s+/g, '');
            chunks[index] = chunks[index].replaceAll('""', '');
          });

          // 2nd cleanup of chunks (delete chunks NOT speakable)
          chunks.forEach((chunk, index) => {
            if (chunks[index].length > 0) {
              chunks[index] = chunks[index] + '. ';
            } else {
              chunks.splice(index, 1);
            }
          });

          // 3rd cleanup of chunks (delete empty chunks)
          chunks.forEach((chunk, index) => {
            if (chunks[index].length == 0) {
              chunks.splice(index, 1);
            }
          });

          // build the chunk OBJECT array
          var chunkSet = [];
          chunks.forEach((chunk, index) => {
            var text        = chunks[index];
            var sectionText = textSlice(text, textSliceLength, minWords);
            var $paragraph  = $('#content').find("p:contains('" + sectionText + "')");
            var offset;

            if ($paragraph.length > 0) {
              offset     = Math.round($paragraph[0].offsetTop);
            } else {
              offset     = undefined;
              $paragraph = undefined;
            }

            chunkSet.push({
              text:         text,
              offsetTop:    offset,
              $paragraph:   $paragraph,
            });
          });

          // create the headings array
          headingsArray = parseContent.selectHeadings(
            defaultOptions.contentSelector,
            defaultOptions.headingSelector
          );

          // parse the headingsArray to add missing offset values
          chunkSet.forEach((chunk, index) => {
            var text;
            var innerText;

            if (chunk.offset === undefined) {
              text = chunk.text.replaceAll('. ', '');

              if (headingsArray !== null) {
                for (var node of headingsArray) {
                  innerText = node.innerText.replaceAll('?', '');
                  innerText = node.innerText.replaceAll('!', '');
                  innerText = node.innerText + pause_spoken;
                  if (innerText == text) {
                    var headline = $('#' + node.id);
                    if (headline.length > 0) {
                      var offsetTop   = headline.offset().top;
                      chunk.offsetTop = Math.round(offsetTop);
                    }
                  }
                }
              }
            }
          });

          return chunkSet;
      }

      // create a slice of text used later to identify the containing paragraph
      function textSlice(text, slicelenght, wordsMin) {
        var startSubString  = 0;
        var endSubString    = startSubString + slicelenght;
        var subText         = text.substr(startSubString, endSubString);
        var stringArray     = subText.split(/(\s+)/);
        var words;

        stringArray.pop();
        stringArray.pop();

        subText = stringArray.join('');
        subText = subText.replaceAll('.', '');

        words = wordCount(subText);
        if (words < wordsMin) {
          console.debug('j1.api.speak2me: no search possible on this fraction of subText: ' + subText);
          console.debug('j1.api.speak2me: number of words found: ' + words + ' lower that words min: ' + wordsMin);
          return undefined;
        } else {
          return subText;
        }
      }

      // process chunks (to speak) sequentially
      function processTextChunks(speaker, chunks) {
        const synth = window.speechSynthesis;

        // indicate active converter in the quicklinks bar
        $('.mdib-speaker').addClass('mdib-spin');

        // listener to ENABLE highlighting and scrolling on active spoken elements
        speaker.addEventListener('start', function(event) {
          // Clean up previous paragraph highlighting
          cleanupParagraphHighlight();

          // Scroll to paragraph
          if (speaker.offsetTop !== undefined) {
            if (speaker.offsetTop >= speaker.previousScrollPosition) {
              window.scrollTo({
                top:      speaker.offsetTop - scrollBlockOffset,
                behavior: scrollBehavior
              });
            }
          }

          // Set up new paragraph highlighting
          if (speaker.$paragraph !== undefined && speaker.$paragraph.length > 0) {
            speaker.$paragraph.addClass('speak2me-paragraph-highlight');
            
            // Prepare Karaoke highlighting for this paragraph
            prepareParagraphForKaraoke(speaker.$paragraph, speaker.text);
          }
        });

        // listener to STOP highlighting for already spoken text elements
        speaker.addEventListener('end', function (event) {
          // Update scroll position tracking
          if (speaker.offsetTop !== undefined) {
            if (speaker.offsetTop >= speaker.previousScrollPosition) {
              speaker.previousScrollPosition = speaker.offsetTop;
            }
            lastScrollPosition = speaker.offsetTop - scrollBlockOffset;
          }

          // Clean up highlighting
          cleanupParagraphHighlight();

          chunkSpoken = false;
          chunkCounter++;
        });

        // loop to prepare ALL chunks to speak or STOP the voice output
        var wasRunOnce = false;
        var speechMonitor = setInterval(function () {
          // check if all chunks (text) are spoken
          if (chunkCounter == chunkCounterMax || userStoppedSpeaking ) {
            chunkCounter        = 0;
            userStoppedSpeaking = false;
            chunkSpoken         = false;

            // Final cleanup
            cleanupParagraphHighlight();

            // remove speak indication
            $('.mdib-speaker').removeClass('mdib-spin');

            clearInterval(speechMonitor);
          } else {

            if (!wasRunOnce && myOptions.isPaused) {
              chunkCounter = myOptions.lastChunk;
              wasRunOnce = true;
            }

            // prepare speaker data and start the voice
            speaker.text       = chunks[chunkCounter].text;
            speaker.offsetTop  = chunks[chunkCounter].offsetTop;
            speaker.$paragraph = chunks[chunkCounter].$paragraph;

            // speak current text line
            if (!chunkSpoken) {
              synth.speak(speaker);
              chunkSpoken = true;
            }
          }
        }, speechMonitorCycle);
      }

      // transform all configured DOM elements of a page that can be spoken into plain text
      function processDOMelements(clone) {
        var copy, title, title_element, content_type, content_element, content, appended, prepend;

        // Remove tags from the "ignoreTags" array
        if (recognizeTagsUser.length > 0) {
          for (var prop in recognizeTagsUser) {
            var index = ignoreTags.indexOf(recognizeTagsUser[prop]);
            if (index > -1) {
                ignoreTags.splice(index, 1);
            }
          }
        };

        // Remove DOM objects listed in the "ignoreTags" array
        for (var prop in ignoreTags) {
          $(clone).find(ignoreTags[prop]).addBack(ignoreTags[prop]).not('[data-speak2me-recognize]').each(function() {
            $(this).html('');
          });
        };

        // Remove DOM objects specified in the "ignoreTagsUser" array
        if (ignoreTagsUser.length > 0) {
          for (var prop in ignoreTagsUser) {
            $(clone).find(ignoreTagsUser[prop]).addBack(ignoreTagsUser[prop]).not('[data-speak2me-recognize]').each(function() {
                $(this).html('');
            });
          };
        };

        // Remove DOM objects marked by "data-speak2me-ignore"
        $(clone).find('[data-speak2me-ignore]').addBack('[data-speak2me-ignore]').each(function() {
          $(this).html('');
        });

        // Remove DOM objects marked by class "speak2me-ignore"
        $(clone).find('.speak2me-ignore').addBack('[data-speak2me-ignore]').each(function() {
          $(this).html('');
        });

        // Search for prepend data specified by "data-speak2me-prepend"
        $(clone).find('[data-speak2me-prepend]').addBack('[data-speak2me-prepend]').each(function() {
          copy = $(this).data('speak2me-prepend');
          $(this).prepend(copy + ' ');
        });

        // Search for append data specified by "data-speak2me-append"
        $(clone).find('[data-speak2me-append]').addBack('[data-speak2me-append]').each(function() {
          copy = $(this).data('speak2me-append');
          $(this).append(' ' + copy);
        });

        // Search for tags to prepend and append specified by the "voiceTags" array
        var count = 0;
        for (var tag in voiceTags) {
          $(clone).find(tag).each(function() {
            if (customTags[tag]) {
                $(this).prepend(customTags[tag].prepend + pause_spoken);
                $(this).append(customTags[tag].append   + pause_spoken);
            } else {
                $(this).prepend(voiceTags[tag].prepend + pause_spoken);
                $(this).append(voiceTags[tag].append   + pause_spoken);
            };
          });
        };

        // Add pause at the end of headings and list items
        $(clone).find('h1,h2,h3,h4,h5,h6,p,li').addBack('h1,h2,h3,h4,h5,h6,p,li').each(function() {
          var text = $(this)[0].innerText;
          text.replace(/\s+/g, '\s');
          text = text + pause_spoken;
          $(this)[0].innerText = text;
        });

        // Add pause for <br> tags
        $(clone).find('br').each(function() {
          $(this).append(pause_spoken);
        });

        // Process <figure> elements
        $(clone).find('figure').addBack('figure').each(function() {
          copy = $(this).find('figcaption').html();

          if (customTags['figure']) {
            prepend = customTags['figure'].prepend;
          }
          else {
            prepend = voiceTags['figure'].prepend;
          }

          if ((copy != undefined) && (copy !== '')) {
            $('<div>' + prepend + pause_spoken + copy + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process <img> tags
        $(clone).find('img').addBack('img').each(function() {
          copy = $(this).attr('alt');
          var parent = $(this).parent();
          var parentName = parent.get(0).tagName;

          if (customTags['img']) {
            prepend = customTags['img'].prepend;
          }
          else {
            prepend = voiceTags['img'].prepend;
          }

          if ((copy !== undefined) && (copy != '')) {
            if (parentName == 'PICTURE') {
                $('<div>' + prepend + pause_spoken + copy + pause_spoken + '</div>').insertBefore(parent);
            } else {
                $('<div>' + prepend + pause_spoken + copy + pause_spoken + '</div>').insertBefore(this);
            }
          }

          $(this).remove();
        });

        // Process anchor tags
        $(clone).find('a').addBack('a').each(function() {
          var anchor  = $(this);
          copy        = anchor[0].innerText;
          prepend     = voiceTags['a'].prepend;
          appended    = voiceTags['a'].append;

          $('<div>' + copy + '</div>').insertBefore(this);
          $('<div>' + appended + '</div>').insertBefore(this);

          $(this).remove();
        });

        // Process admonition blocks
        $(clone).find('.admonitionblock').addBack('.admonitionblock').each(function() {
          content_type    = this.classList[1];
          content_element = $(this).find('.content');
          content         = content_element[0].innerText;
          prepend         = voiceTags['.admonitionblock'].prepend + content_type + '. ';
          appended        = voiceTags['.admonitionblock'].append;

          if ((content !== undefined) && (content != '')) {
            $('<div>' + prepend + ' ' + content + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process parallax quote blocks
        $(clone).find('.parallax-quoteblock').addBack('.parallax-quoteblock').each(function() {
          content_element = $(this).find('.quote-text');
          content         = content_element[0].innerText + '' + pause_spoken;
          prepend         = voiceTags['quoteblock'].prepend;
          appended        = voiceTags['quoteblock'].append;

          if ((content !== undefined) && (content != '')) {
            $('<div>' + prepend  + pause_spoken + content + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process quote blocks
        $(clone).find('.quoteblock').addBack('.quoteblock').each(function() {
          var attribution = $(this).find('.attribution');
          content_element = $(this).find('blockquote');
          content         = content_element[0].innerText + '' + attribution[0].innerText;
          prepend         = voiceTags['quoteblock'].prepend;
          appended        = voiceTags['quoteblock'].append;

          if ((content !== undefined) && (content != '')) {
            $('<div>' + prepend  + pause_spoken + content + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process tables
        $(clone).find('table').addBack('table').each(function() {
          copy      = $(this).find('caption').text();
          prepend   = voiceTags['table'].prepend;
          appended  = voiceTags['table'].append;

          if ((copy !== undefined) && (copy != '')) {
            $('<div>' + prepend  + pause_spoken + copy + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process audio blocks
        $(clone).find('.audioblock').addBack('.audioblock').each(function() {
          copy      = $(this).find('.title').text();
          prepend   = voiceTags['.audioblock'].prepend;
          appended  = voiceTags['.audioblock'].append;

          if ((copy !== undefined) && (copy != '')) {
            $('<div>' + prepend  + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process video blocks
        $(clone).find('.videoblock').addBack('.videoblock').each(function() {
          copy      = $(this).find('.title').text();
          prepend   = voiceTags['.videoblock'].prepend;
          appended  = voiceTags['.videoblock'].append;

          if ((copy !== undefined) && (copy != '')) {
            $('<div>' + prepend  + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process VideoJS players
        $(clone).find('.videojs-player').addBack('.videojs-player').each(function() {
          copy      = $(this).find('.video-title').text();
          prepend   = voiceTags['.videojs-player'].prepend;
          appended  = voiceTags['.videojs-player'].append;

          if ((copy !== undefined) && (copy != '')) {
            $('<div>' + prepend  + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process YouTube players
        $(clone).find('.youtube-player').addBack('.youtube-player').each(function() {
          copy      = $(this).find('.video-title').text();
          prepend   = voiceTags['.youtube-player'].prepend;
          appended  = voiceTags['.youtube-player'].append;

          if ((copy !== undefined) && (copy != '')) {
            $('<div>' + prepend  + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process Dailymotion players
        $(clone).find('.dailymotion-player').addBack('.dailymotion-player').each(function() {
          copy      = $(this).find('.video-title').text();
          prepend   = voiceTags['.dailymotion-player'].prepend;
          appended  = voiceTags['.dailymotion-player'].append;

          if ((copy !== undefined) && (copy != '')) {
            $('<div>' + prepend  + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process Vimeo players
        $(clone).find('.vimeo-player').addBack('.vimeo-player').each(function() {
          copy      = $(this).find('.video-title').text();
          prepend   = voiceTags['.vimeo-player'].prepend;
          appended  = voiceTags['.vimeo-player'].append;

          if ((copy !== undefined) && (copy != '')) {
            $('<div>' + prepend  + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process Wistia players
        $(clone).find('.wistia-player').addBack('.wistia-player').each(function() {
          copy      = $(this).find('.video-title').text();
          prepend   = voiceTags['.wistia-player'].prepend;
          appended  = voiceTags['.wistia-player'].append;

          if ((copy !== undefined) && (copy != '')) {
            $('<div>' + prepend  + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process card headers
        $(clone).find('.card-header').addBack('card-header').each(function() {
          title_element = $(this).find('.card-title');
          prepend       = voiceTags['card-header'].prepend;
          appended      = voiceTags['card-header'].append;

          if (title_element.length) {
            title = title_element[0].innerText + pause_spoken;
          } else {
            title = '';
          }

          $('<div>' + prepend  + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + pause_spoken + title + '</div>').insertBefore(this);

          $(title_element).remove();
        });

        // Process doc-example elements
        $(clone).find('.doc-example').addBack('.doc-example').each(function() {
          prepend       = voiceTags['.doc-example'].prepend;
          appended      = voiceTags['.doc-example'].append;

          $('<div>' + prepend  + pause_spoken  + '</div>').insertBefore(this);
          $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);

          $(this).remove();
        });

        // Process listing blocks
        $(clone).find('.listingblock').addBack('.listingblock').each(function() {
          title_element = $(this).find('.title');

          if (title_element.length) {
            copy = title_element[0].innerText;
          } else {
            copy = '';
          }

          prepend  = voiceTags['.listingblock'].prepend;
          appended = voiceTags['.listingblock'].append;

          if ((copy !== undefined) && (copy != '')) {
            $('<div>' + prepend + ' with the title,' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }

          $(this).remove();
        });

        // Process gist elements
        $(clone).find('.gist').addBack('.gist').each(function() {
          if ($(this).prev()[0] !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = $(this).prev();
            $(title_element).remove();
          } else {
            title = '';
          }

          prepend  = voiceTags['.gist'].prepend;
          appended = voiceTags['.gist'].append;

          if ((title !== undefined) && (title != '')) {
            $('<div>' + prepend + ' with the title, ' + title + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend  + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }

          $(this).remove();
      });

      // Process modal elements
      $(clone).find('.modal').addBack('.modal').each(function() {
        $(this).remove();
      });

      // Process masonry elements
      $(clone).find('.masonry').addBack('.masonry').each(function() {
        if ($(this).prev()[0] !== undefined) {
          title = $(this).prev()[0].innerText;
          title_element = $(this).prev();
          $(title_element).remove();
        } else {
          title = '';
        }

        prepend  = voiceTags['.masonry'].prepend;
        appended = voiceTags['.masonry'].append;

        if ((title !== undefined) && (title != '')) {
          $('<div>' + prepend + ' with the title,' + title + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + '</div>').insertBefore(this);
        } else {
          $('<div>' + prepend  + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
        }

        $(this).remove();
      });

      // Process slider elements
      $(clone).find('.slider').addBack('.slider').each(function() {
        if ($(this).prev()[0] !== undefined) {
          title = $(this).prev()[0].innerText;
          title_element = $(this).prev();
          $(title_element).remove();
        } else {
          title = '';
        }

        prepend  = voiceTags['.slider'].prepend;
        appended = voiceTags['.slider'].append;

        if ((title !== undefined) && (title != '')) {
          $('<div>' + prepend + ' with the title, ' + title + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + '</div>').insertBefore(this);
        } else {
          $('<div>' + prepend  + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
        }

        $(this).remove();
      });

      // Process gallery elements
      $(clone).find('.gallery').addBack('.gallery').each(function() {
        if ($(this).prev()[0] !== undefined) {
          title = $(this).prev()[0].innerText;
          title_element = $(this).prev();
          $(title_element).remove();
        } else {
          title = '';
        }

        prepend  = voiceTags['.gallery'].prepend;
        appended = voiceTags['.gallery'].append;

        if ((title !== undefined) && (title != '')) {
          (prepend !== '')  && $('<div>' + prepend + ' with the title ' + title + pause_spoken + '</div>').insertBefore(this);
          (appended !== '') && $('<div>' + appended + '</div>').insertBefore(this);
        } else {
          (prepend !== '')  && $('<div>' + prepend + pause_spoken  + '</div>').insertBefore(this);
          (appended !== '') && $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
        }

        $(this).remove();
      });

      // Process swiper-app elements
      $(clone).find('.swiper-app').addBack('.swiper-app').each(function() {
        if ($(this).prev()[0] !== undefined) {
          title = $(this).prev()[0].innerText;
          title_element = $(this).prev();
          $(title_element).remove();
        } else {
          title = '';
        }

        prepend  = voiceTags['.swiper-app'].prepend;
        appended = voiceTags['.swiper-app'].append;

        if ((title !== undefined) && (title != '')) {
          (prepend !== '')  && $('<div>' + prepend + ' with the title ' + title + pause_spoken + '</div>').insertBefore(this);
          (appended !== '') && $('<div>' + appended + '</div>').insertBefore(this);
        } else {
          (prepend !== '')  && $('<div>' + prepend + pause_spoken  + '</div>').insertBefore(this);
          (appended !== '') && $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
        }

        $(this).remove();
      });

      // Process lightbox blocks
      $(clone).find('.lightbox-block').addBack('.lightbox-block').each(function() {
        if ($(this).prev()[0] !== undefined) {
          title = $(this).prev()[0].innerText;
          title_element = $(this).prev();
          $(title_element).remove();
        } else {
          title = '';
        }

        prepend   = voiceTags['.lightbox-block'].prepend;
        appended  = voiceTags['.lightbox-block'].append;

        if ((title !== undefined) && (title != '')) {
          $('<div>' + prepend + ' with the title,' + title + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + '</div>').insertBefore(this);
        } else {
          $('<div>' + prepend  + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
        }

        $(this).remove();
      });

      // Process data-speak2me-swap
      $(clone).find('[data-speak2me-swap]').addBack('[data-speak2me-swap]').each(function() {
        copy = $(this).data('speak2me-swap');
        $(this).text(copy);
      });

      // Process data-speak2me-spell
      $(clone).find('[data-speak2me-spell]').addBack('[data-speak2me-spell]').each(function() {
        copy = $(this).text();
        copy = copy.split('').join(' ');
        $(this).text(copy);
      });
      
      return clone;
    }

    // run final cleanups on all DOM elements processed
    function cleanDOMelements(final) {
      var start, ended, speak, part1, part2, final;

      // Process <speak2me> comments
      while (final.indexOf('<!-- <speak2me>') != -1) {
          start = final.indexOf('<!-- <speak2me>');
          ended = final.indexOf('</speak2me> -->', start);
          if (ended == -1) { break; }
          speak = final.substring(start + 17, ended);
          part1 = final.substring(0, start);
          part2 = final.substring(ended + 17);
          final = part1 + ' ' + speak + ' ' + part2;
      };

      // Strip out remaining comments
      final = final.replace(/<!--[\s\S]*?-->/g, '');

      // Strip out remaining HTML tags
      final = final.replace(/(<([^>]+)>)/ig, '');

      // Replace strings as specified by speak2me('replace')
      var len = replacements.length;
      var i   = 0;
      var old, rep;

      // while (i < len) {
      //   old = replacements[i];
      //   old = old.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\        // Search for tags to prepend and append specified by the "voiceTags" array
      //   var count = 0;
      //   for');
      //   rep = replacements[i + 1] + ' ';
      //   var regexp = new RegExp(old, 'gi');
      //   var final = final.replace(regexp, rep);
      //   i = i + 2;
      // }

      while (i < len) {
        old = replacements[i];
        old = old.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        rep = replacements[i + 1] + ' ';
        var regexp = new RegExp(old, 'gi');
        var final = final.replace(regexp, rep);
        i = i + 2;
      }

      // Remove double quotes
      final = final.replaceAll('"', '');
      final = final.replaceAll('"', '');
      final = final.replaceAll('"', '');

      // Replace colons with periods
      final = final.replaceAll(':', '.');

      // Clean up punctuation
      final = final.replaceAll('., ', '. ');
      final = final.replaceAll(' , ', ', ');
      final = final.replaceAll('. .', '');
      final = final.replaceAll(', .', '');
      final = final.replaceAll('  ,  ', '');

      // Replace empty lines
      final = final.replace(/^$/g, '\n');
      final = final.replace(/^\s+$/g, '\n');

      // Replace single full stops
      final = final.replace(/\s+\.\s+/g, '\n');
      final = final.replace(/\s+\.\s+$/g, '\n');

      // Replace double full stops
      final = final.replace(/\.\./g, '.');

      // Replace abbreviations
      final = final.replaceAll('e.g.',  'for example');
      final = final.replaceAll('E.g.',  'For example, ');
      final = final.replaceAll('etc.',  'and so on, ');
      final = final.replaceAll('z. B.', 'zum Beispiel, ');

      // Remove question and exclamation marks
      final = final.replace(/[\!\?]/g, '. ');

      // Replace dashes with pauses
      final = final.replaceAll('—', pause_spoken);
      final = final.replaceAll('–', pause_spoken);
      final = final.replaceAll('--', pause_spoken);

      // Decode HTML entities
      var txt = document.createElement('textarea');
      txt.innerHTML = final;
      final = txt.value;

      // Replace single word in line
      final = final.replace(/^\s*(\b\w+\b)\s*$/gm, "$1. ");

      // Replace month year in line
      final = final.replace(/^\s*(\b\w+\b\s*[0-9]{4})$/gm, "$1. ");

      // Replace multiple whitespaces
      final = final.replace(/\s+/g, ' ');

      // Split the final text into chunks
      const textChunks = splitTextIntoChunks(final);
      chunkCounterMax = textChunks.length;

      return textChunks;
    }

    return speech;
    },

    pause: function() {
      window.speechSynthesis.pause();
      return this;
    },

    resume: function() {
      window.speechSynthesis.resume();
      return this;
    },

    stop: function() {
      window.speechSynthesis.cancel();
      userStoppedSpeaking = true;
      cleanupParagraphHighlight();
    },

    enabled: function() {
      return ('speechSynthesis' in window);
    },

    isSpeaking: function() {
      return (window.speechSynthesis.speaking);
    },

    isSpoken: function() {
      if (window.speechSynthesis.speaking) {
        return chunkCounter;
      } else {
        return false;
      }
    },

    isScrolled: function() {
      if (window.speechSynthesis.speaking) {
        return lastScrollPosition;
      } else {
        return false;
      }
    },

    isPaused: function() {
      return (window.speechSynthesis.paused);
    },

    rate: function() {
      var num = arguments[0];

      if ((num >= 0.1) && (num <= 10)) {
        rateUserDefault = num;
      } else if (num === undefined) {
        rateUserDefault = void 0;
        rate = rateDefault;
      }

      return this;
    },

    pitch: function() {
      var num = arguments[0];

      if ((num >= 0.1) && (num <= 2)) {
        pitchUserDefault = num;
      } else if (num === undefined) {
        pitchUserDefault = void 0;
        pitch = pitchDefault;
      }

      return this;
    },

    volume: function() {
      var num = arguments[0];

      if ((num >= 0) && (num <= 1)) {
        volumeUserDefault = num;
      } else if (num === undefined) {
        volumeUserDefault = void 0;
        volume = volumeDefault;
      };
      return this;
    },

    ignore: function() {
      var len = arguments.length;
      ignoreTagsUser.length = 0;

      while (len > 0) {
        len--;
        ignoreTagsUser.push(arguments[len]);
      };

      return this;
    },

    recognize: function() {
      var len = arguments.length;
      recognizeTagsUser.length = 0;

      while (len > 0) {
        len--;
        recognizeTagsUser.push(arguments[len]);
      }

      return this;
    },

    replace: function() {
      var len = arguments.length;
      replacements.length = 0;

      var i = 0;
      while (i < len) {
        replacements.push(arguments[i], arguments[i + 1]);
        i = i + 2;
        if ((len - i) == 1) { break; };
      };

      return this;
    },

    customize: function() {
      var len = arguments.length;

      if (len == 0) {
          customTags = [];
      }

      if (len == 2) {
        if (['img','table','figure'].indexOf(arguments[0]) == -1) {
          console.warn("When customizing, tag indicated must be either 'img', 'table', or 'figure'.");
          return;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString());
      }

      if (len == 3) {
        if (['q',"ol","ul","blockquote"].indexOf(arguments[0]) == -1) {
          console.warn("When customizing, tag indicated must be either 'q', 'ol', 'ul' or 'blockquote'.");
          return;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString(), arguments[2].toString());
      }

      return this;
    },

    getVoices: function() {
      if (arguments.length == 0) {
          return voices;
      }

      var obj = $(arguments[0]);
      var selectionTxt = 'Choose a voice';

      if (arguments[1] !== undefined) {
        selectionTxt = arguments[1];
      }

      obj.append($("<select id='voiceSelect' name='voiceSelect'><option value='none'>" + selectionTxt + "</option></select>"));

      var skippedVoices = 0;
      for (var i = 0; i < voices.length ; i++) {
        if (isChrome && voices[i].name.includes(ignoreProvider)) {
          skippedVoices++;
          continue;
        }
        if (isEdge && !voices[i].name.includes('Natural')) {
          skippedVoices++;
          continue;
        }

        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].language + ')';
        option.setAttribute('value', voices[i].name);

        if (voiceLanguageDefault !== undefined) {
          if ( voices[i].name ===  voiceLanguageDefault ) {
            option.setAttribute('selected', 'selected');
          }
        } else {
          if ( voices[i].name.includes(voiceUserDefault) ) {
          }
        }

        option.setAttribute('data-speak2me-language', voices[i].language);
        obj.find('select').append(option);
      }

      return i - skippedVoices;
    },

    setVoice: function() {
      if (arguments.length < 2) {
        return this;
      }

      var requestedVoice, requestedLanguage;

      if (arguments[0] == 'name') {
        requestedVoice = arguments[1];

        for (var i = 0; i < voices.length; i++) {
          if (voices[i].name == requestedVoice) {
            voiceUserDefault = requestedVoice;
          }
        }
      }

      if (arguments[0] == 'language') {
        requestedLanguage = arguments[1].toUpperCase();

        if (requestedLanguage.length == 2) {
          for (var i = 0; i < voices.length; i++) {
            if (voices[i].language.substring(0,2).toUpperCase() == requestedLanguage) {
              voiceUserDefault = voices[i].name;
              break;
            }
          }
        } else {
          for (var i = 0; i < voices.length; i++) {
            if (voices[i].language == requestedLanguage) {
              voiceUserDefault = voices[i].name;
              break;
            }
          }
        }
      }

      return this;
    }
  };

  // main speak2me method
  $.fn.speak2me = function(method) {
    if (methods[method]) {
      return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.speak.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on $.speak2me');
    }
  };

}($));