/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/speak2me/js/speak2me.js
 # speak2me v.1.0 implementation (based on Articulate.js) for J1 Theme
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/acoti/articulate.js/tree/master
 #
 # Copyright (C) 2023 Juergen Adams
 # Copyright (C) 2017 Adam Coti
 #
 # J1 Theme is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # Articulate is licensed under the MIT License.
 # See: https://github.com/acoti/articulate.js/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

/* Articulate.js (1.1.0). (C) 2017 Adam Coti.
  MIT @license: en.wikipedia.org/wiki/MIT_License
  See Github page at: https://github.com/acoti/articulate.js
  See Web site at: http://articulate.purefreedom.com
*/

(function($) {
    'use strict';

    var defaultOptions      = require('./default-options.js');
    var customOptions       = {};
    var myOptions           = {}

    // var _this = window;

    var ParseContent        = require('./parse-content.js');
    var parseContent        = ParseContent(defaultOptions);

    var ignoreTagsUser      = new Array();
    var recognizeTagsUser   = new Array();
    var replacements        = new Array();
    var customTags          = new Array();
    var voices              = new Array();
    var headingsArray       = [];

    var rateDefault         = 0.9;
    var pitchDefault        = 1;
    var volumeDefault       = 0.9;
    var rate                = rateDefault;
    var pitch               = pitchDefault;
    var volume              = volumeDefault;
    var pageScanCycle       = 1000;
    var pageScanLines       = 10000;
    var linesCorrection     = 5000;

    var currentTranslation  = getCookie('googtrans');

    var voiceUserDefault    = 'Google UK English Female';
    var voiceChromeDefault  = 'Google US English';
    var ignoreProvider      = 'Microsoft';
    var preferredVoice      = 'Natural';

    var isEdge              = /Edg/i.test( navigator.userAgent );
    var chrome              = /chrome/i.test( navigator.userAgent );
    var isChrome            = ((chrome) && (!isEdge));

    var voiceLanguageGoogleDefault = {
      'de-DE':  'Google Deutsch',
      'en-US':  'Google US English',
      'en-GB':  'Google UK English Female',
      'es-ES':  'Google español',
      'fr-FR':  'Google français',
//    'hi-IN':  'Google हिन्दी',
//    'id-ID':  'Google Bahasa Indonesia',
      'it-IT':  'Google italiano',
//    'jp-JP':  'Google 日本語',
//    'ko-KR':  'Google 한국의',
      'nl-NL':  'Google Nederlands',
      'pl-PL':  'Google polski',
//    'pt-BR':  'Google português do Brasil',
      'pt-PT':  'Google português do Brasil',
//    'ru-RU':  'Google русский',
//    'zh-CN':  'Google 普通话（中国大陆)',
    };

    var voiceLanguageMicrosoftDefault = {
      'sq-AL':  'Microsoft Anila Online (Natural) - Albanian (Albania)',
      'ar-EG':  'Microsoft Salma Online (Natural) - Arabic (Egypt)',
      'bg-BG':  'Microsoft Kalina Online (Natural) - Bulgarian (Bulgaria)',
      'zh-CN':  'Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)',
      'hr-HR':  'Microsoft Gabrijela Online (Natural) - Croatian (Croatia)',
      'cs-CZ':  'Microsoft Antonin Online (Natural) - Czech (Czech)',
      'da-DK':  'Microsoft Christel Online (Natural) - Danish (Denmark)',
      'nl-NL':  'Microsoft Colette Online (Natural) - Dutch (Netherlands)',
      'en-GB':  'Microsoft Libby Online (Natural) - English (United Kingdom)',
      'en-US':  'Microsoft Aria Online (Natural) - English (United States)',
      'et-EE':  'Microsoft Anu Online (Natural) - Estonian (Estonia)',
      'fi-FI':  'Microsoft Noora Online (Natural) - Finnish (Finland)',
      'fr-FR':  'Microsoft Denise Online (Natural) - French (France)',
      'ka-GE':  'Microsoft Giorgi Online (Natural) - Georgian (Georgia)',
      'de-DE':  'Microsoft Katja Online (Natural) - German (Germany)',
      'el-GR':  'Microsoft Athina Online (Natural) - Greek (Greece)',
      'he-IL':  'Microsoft Avri Online (Natural) - Hebrew (Israel)',
      'hi-IN':  'Microsoft Madhur Online (Natural) - Hindi (India)',
      'hu-HU':  'Microsoft Noemi Online (Natural) - Hungarian (Hungary)',
      'it-IT':  'Microsoft Elsa Online (Natural) - Italian (Italy)',
      'ja-JP':  'Microsoft Nanami Online (Natural) - Japanese (Japan)',
    }

    var rateUserDefault;
    var pitchUserDefault;
    var volumeUserDefault;
    var currentLanguage;
    var voiceLanguageDefault;
    var chunkCounter = 0;
    var chunkCounterMax;
    var userStoppedSpeaking = false;
    var currentSection;
    var user_session;
    var scanFinished;

    // -------------------------------------------------------------------------
    // Internal functions
    // -------------------------------------------------------------------------

    // jadams
    // see: https://stackoverflow.com/questions/3163615/how-to-scroll-an-html-page-to-a-given-anchor
    // see: https://stackoverflow.com/questions/22154129/how-to-make-setinterval-behave-more-in-sync-or-how-to-use-settimeout-instea
    //
    function scanPage(options) {
      var line = 0;
      var lines;

      function scanSection(counter) {
        // because of the current translation in progress, the length
        // of a page may change to higher or lower values (asian)
        //
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
            $(window).scrollTop(0);
          }, pageScanCycle);
        }
      }
      scanSection(0);
    }

    function extend () {
      var target = {}
      for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key]
          }
        }
      }
      return target
    }

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

    // This populates the "voices" array with objects that represent the
    // available voices in the current browser. Each object has two
    // properties: name and language. It is loaded asynchronously in
    // deference to Chrome.
    //
    function populateVoiceList() {
        var systemVoices = speechSynthesis.getVoices();
        for(var i = 0; i<systemVoices.length; i++) {
          voices.push(new voiceObj(systemVoices[i].name, systemVoices[i].lang));
        }
    }
    populateVoiceList();

    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // After checking for compatability, define the utterance object and
    // then cancel the speech immediately even though nothing is yet spoken.
    // This is to fix a quirk in Windows Chrome.
    //
    if ('speechSynthesis' in window) {
        var speech = new SpeechSynthesisUtterance();
        window.speechSynthesis.cancel();
    }

    if ( currentTranslation === undefined ) {
        currentLanguage = 'en-US'
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

    // Return if no headings are found.
    // if (headingsArray === null) {
    //   return
    // }

    // -------------------------------------------------------------------------
    // Public functions
    // -------------------------------------------------------------------------
    //
    var methods = {

      speak: function(options) {
          var opts      = $.extend( {}, $.fn.speak2me.defaults, options );
          var toSpeak   = '';
          var voiceTags = new Array();
          var _this     = this;
          var obj, processed, finished;
          var ignoreTags;

          scanFinished  = false;
          myOptions     = extend(defaultOptions, customOptions || {});

          // Get headings array
          // Merge defaults with user options.
          // Set to options variable at the top
//        headingsArray = parseContent.selectHeadings(myOptions.contentSelector, myOptions.headingSelector);

          if (currentTranslation !== undefined) {
            scanPage();
          } else {
            scanFinished = true;
          }

          // Default values
          //
          voiceTags['a']          = new voiceTag('clicking the link,', '');
          voiceTags['q']          = new voiceTag(',', '');
          voiceTags['ol']         = new voiceTag('Start of list.', 'End of list.');
          voiceTags['ul']         = new voiceTag('Start of list.', 'End of list.');
          voiceTags['dl']         = new voiceTag('Start of list.', 'End of list.');
          voiceTags['dt']         = new voiceTag('', ', ');
          voiceTags['img']        = new voiceTag('There\'s an embedded image with the description,', 'Note, image-based contents are not spoken.');
          voiceTags['table']      = new voiceTag('There\'s an embedded table with the caption,', 'Note, table contents are not spoken.');
          voiceTags['carousel']   = new voiceTag('There\'s an embedded carousel element with the caption,', 'Note, carousel elements are not spoken.');
          voiceTags['slider']     = new voiceTag('There\'s an embedded slider element with the caption,', 'Note, slider elements are not spoken.');
          voiceTags['masonry']    = new voiceTag('There\'s an embedded masonry element with the caption,', 'Note, masonry elements are not spoken.');
          voiceTags['lightbox']    = new voiceTag('There\'s an embedded lightbox element with the caption,', 'Note, lightbox elements are not spoken.');
          voiceTags['gallery']    = new voiceTag('There\'s an embedded gallery element with the caption,', 'Note, gallery elements are not spoken.');
          voiceTags['figure']     = new voiceTag('There\'s an embedded figure with the caption,', '');
          voiceTags['blockquote'] = new voiceTag('Blockquote start.', 'Blockquote end.');

//        ignoreTags = ['audio','button','canvas','code','del','dialog','dl','embed','form','head','iframe','meter','nav','noscript','object','s','script','select','style','textarea','video'];
//        ignoreTags = ['masonry', 'carousel', 'slider', 'pre','audio','button','canvas','code','del','dialog','embed','form','head','iframe','meter','nav','noscript','object','s','script','select','style','textarea','video'];
          ignoreTags = ['audio','button','canvas','code','del', 'pre', 'dialog','embed','form','head','iframe','meter','nav','noscript','object','s','script','select','style','textarea','video'];


          // jadams: check moved to adapter
          // Check to see if the browser supports the functionality.
          //
          // if (!('speechSynthesis' in window)) {
          //     alert('Sorry, this browser does not support the Web Speech API.');
          //     return
          // };

          // jadams: do NOT work for multiple 'tabs' for the same browser
          //
          // If something is currently being spoken, ignore new voice
          // request. Otherwise it would be queued, which is doable if
          // someone wanted that, but not what I wanted.
          //
          if (window.speechSynthesis.speaking) {
              return
          };

          // jadams
          // NOTE: coincident active speech synthesis in multiple
          // browser windows (tabs) does NOT work
          //
          // user_session = j1.readCookie('j1.user.session');
          // if (user_session.speech_synthesis_active === true) {
          //     return
          // };

          // user_session.speech_synthesis_active  = true;
          // j1.writeCookie({
          //   name:     'user_session',
          //   data:     user_session,
          //   secure:   false,
          //   expires:  0
          // });

          // jadams
          var processSpeech = setInterval(function () {
            if (scanFinished) {
              // Cycle through all the elements in the original jQuery
              // selector, process and clean them one at a time, and
              // continually append it to the variable "toSpeak".
              //
              _this.each(function() {
                  obj = $(this).clone();                    // clone the DOM node and its descendants of what the user wants spoken
                  processed = processDOMelements(obj);      // process and manipulate DOM tree of this clone
                  processed = jQuery(processed).html();     // convert the result of all that to a string
                  finished = cleanDOMelements(processed);   // do some text manipulation
                  toSpeak = finished;
              });

              // Check if users have set their own rate/pitch/volume
              // defaults, otherwise use defaults
              //
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

              // jadams
              // This is where the magic happens. Well, not magic, but at
              // least we can finally hear something. After the line that
              // fixes the Windows Chrome quirk, the custom voice is set
              // if one has been chosen.
              //
              speech = new SpeechSynthesisUtterance();
              speech.rate = rate;
              speech.pitch = pitch;
              speech.volume = volume;
              speech.voice = undefined;

              // jadams
              if (isChrome) {
                speech.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voiceLanguageDefault; })[0];
    //          speech.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voiceChromeDefault; })[0];
              };

              // jadams
              if (isEdge) {
                speech.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voiceLanguageDefault; })[0];
              };

              // jadams
              processTextChunks(speech, toSpeak);
              clearInterval(processSpeech);
            }
          }, 50); // END processSpeech

          // jadams
          function splitTextIntoChunks(text, chunkSize) {
            const chunks = text.split(/[.!?]/);

            // cleanup chunks
            //
            chunks.forEach((chunk, index) => {
              chunks[index] = chunk.replace(/^\s+|\s+$/g, '');
              chunks[index] = chunks[index] + '. ';
            });

            return chunks;
        }

        // jadams
        // Funktion zur sequenziellen Verarbeitung der Textkette
        //
        function processTextChunks(speaker, chunks) {
          const synth = window.speechSynthesis;
          var sectionText;

          speaker.text    = chunks[chunkCounter];
          sectionText     = speaker.text.substr(0, 20);
          currentSection  = $('#content').find("p:contains('" + sectionText + "')")[0];

          synth.speak(speaker);

          speaker.addEventListener('start', (event) => {
            $('.mdib-speaker').addClass('mdib-spin');
            var sectionText     = speaker.text.substr(0, 20);
            currentSection  = $('#content').find("p:contains('" + sectionText + "')")[0];
            if (currentSection !== undefined) {
              $(currentSection).addClass('speak-highlighted');
              window.scrollTo({top: currentSection.offsetTop-100, behavior: 'smooth'});
            }
            // $('#speak_button').hide();
          });

          speaker.addEventListener('end', function (event) {
            var sectionText = speaker.text.substr(0, 20).trim();
            currentSection  = $('#content').find("p:contains('" + sectionText + "')")[0];
            if (currentSection !== undefined) {
              $(currentSection).removeClass('speak-highlighted');
            }
            chunkCounter ++;
          });

          // jadams
          var speechMonitor = setInterval(function () {
            // chunkCounterMax = 4;
            if (! synth.speaking ) {
              if (chunkCounter == chunkCounterMax || userStoppedSpeaking ) {
                chunkCounter = 0;
                userStoppedSpeaking = false;

                var sectionText = speaker.text.substr(0, 20).trim();
                currentSection  = $('#content').find("p:contains('" + sectionText + "')")[0];

                if (currentSection !== undefined) {
                  $(currentSection).removeClass('speak-highlighted');
                  // $('#speak_button').show();
                }

                window.scrollTo({top: 0, behavior: 'smooth'});
                $('.mdib-speaker').removeClass('mdib-spin');
                clearInterval(speechMonitor);
              } else {
                speaker.text    = chunks[chunkCounter];
                sectionText     = speaker.text.substr(0, 20);
                currentSection  = $('#content').find("p:contains('" + sectionText + "')")[0];

                if (currentSection !== undefined) {
                  $(currentSection).addClass('speak-highlighted');
                }

                synth.speak(speaker);
              }
            }
          }, 50); // END speechMonitor

        } // END processTextChunks

        // jadams
        function processDOMelements(clone) {
          var copy, title, title_element, content, appended, prepend;

          // Remove tags from the "ignoreTags" array because the
          // user called "speak2me('recognize')" and said he/she
          // doesn't want some tags un-spoken. Double negative there,
          // but it does make sense.
          //
          if (recognizeTagsUser.length > 0) {
              for (var prop in recognizeTagsUser) {
                  var index = ignoreTags.indexOf(recognizeTagsUser[prop]);
                  if (index > -1) {
                      ignoreTags.splice(index, 1);
                  }
              };
          };

          // Remove DOM objects from those listed in the "ignoreTags"
          // array now that the user has specified which ones,
          // if any, he/she wants to keep
          //
          for (var prop in ignoreTags) {
              jQuery(clone).find(ignoreTags[prop]).addBack(ignoreTags[prop]).not('[data-speak2me-recognize]').each(function() {
                  jQuery(this).html('');
              });
          };

          // Remove DOM objects specified in the "ignoreTagsUser"
          // array that the user specified when calling "speak2me('ignore')".
          //
          if (ignoreTagsUser.length > 0) {
              for (var prop in ignoreTagsUser) {
                  jQuery(clone).find(ignoreTagsUser[prop]).addBack(ignoreTagsUser[prop]).not('[data-speak2me-recognize]').each(function() {
                      jQuery(this).html('');
                  });
              };
          };

          // Remove DOM objects specified in the HTML with
          // "data-speak2me-ignore"
          //
          jQuery(clone).find('[data-speak2me-ignore]').addBack('[data-speak2me-ignore]').each(function() {
              jQuery(this).html('');
          });

          // jadams
          // Remove DOM objects specified in the HTML by class "speak2me-ignore"
          //
          jQuery(clone).find('.speak2me-ignore').addBack('[data-speak2me-ignore]').each(function() {
//            jQuery(this).html("The following element in the article is skipped to be spoken. ");
              jQuery(this).html('');
          });

          // Search for prepend data specified in the HTML
          // with "data-speak2me-prepend"
          jQuery(clone).find('[data-speak2me-prepend]').addBack('[data-speak2me-prepend]').each(function() {
              copy = jQuery(this).data('speak2me-prepend');
              jQuery(this).prepend(copy + ' ');
          });

          // Search for append data specified in the HTML
          // with "data-speak2me-append"
          //
          jQuery(clone).find('[data-speak2me-append]').addBack('[data-speak2me-append]').each(function() {
              copy = jQuery(this).data('speak2me-append');
              jQuery(this).append(' ' + copy);
          });

          // jadams
          // Search for tags to prepend and append specified by
          // the "voiceTags" array.
          //
          var count = 0;
          for (var tag in voiceTags) {
//            count++
//            if (count <= 4) {
                  jQuery(clone).find(tag).each(function() {
                      if (customTags[tag]) {
                          jQuery(this).prepend(customTags[tag].prepend + ' ');
                          jQuery(this).append(' ' + customTags[tag].append);
                      } else {
                          jQuery(this).prepend(voiceTags[tag].prepend + ' ');
                          jQuery(this).append(' ' + voiceTags[tag].append);
                      };
                  });
//              };
          };

          // Search for <h1> through <h6> and <li> and <br> to add
          // a pause at the end of those tags. This is done
          // because these tags require a pause, but often don't
          // have a comma or period at the end of their text.
          //
          jQuery(clone).find('h1,h2,h3,h4,h5,h6,li,p').addBack('h1,h2,h3,h4,h5,h6,li,p').each(function() {
              jQuery(this).append('. ');
          });
          jQuery(clone).find('br').each(function() {
              jQuery(this).after(', ');
          });

          // Search for <figure>, check for <figcaption>, insert
          // that text if it exists and then remove the whole DOM object
          //
          jQuery(clone).find('figure').addBack('figure').each(function() {
              copy = jQuery(this).find('figcaption').html();
              if (customTags['figure']) {
                  prepend = customTags['figure'].prepend
              }
              else {
                  prepend = voiceTags['figure'].prepend
              }
              if ((copy != undefined) && (copy !== '')) {
                  jQuery('<div>' + prepend + ' ' + copy + '.</div>').insertBefore(this);
              }
              jQuery(this).remove();
          });

          // Search for <image>, check for ALT attribute, insert that
          // text if it exists and then remove the whole DOM object.
          // Had to make adjustments for nesting in <picture> tags.
          //
          jQuery(clone).find('img').addBack('img').each(function() {
              copy = jQuery(this).attr('alt');
              var parent = jQuery(this).parent();
              var parentName = parent.get(0).tagName;
              if (customTags['img']) {
                  prepend = customTags['img'].prepend
              }
              else {
                  prepend = voiceTags['img'].prepend
              };
              if ((copy !== undefined) && (copy != '')) {
                  if (parentName == 'PICTURE') {
                      var par
                      jQuery('<div>' + prepend + ' ' + copy + '.</div>').insertBefore(parent);
                  } else {
                      jQuery('<div>' + prepend + ' ' + copy + '.</div>').insertBefore(this);
                  }
              };
              jQuery(this).remove();
          });

          // jadams
          // Search for <table>, check for <caption>, insert that
          // text if it exists and then remove the whole DOM object
          //
          jQuery(clone).find('table').addBack('table').each(function() {
              copy    = jQuery(this).find('caption').text();
//            content = jQuery(this).find("tbody");

              if (customTags['table']) {
                  prepend   = customTags['table'].prepend
                  appended  = customTags['table'].append;
              }
              else {
                  prepend   = voiceTags['table'].prepend
                  appended  = voiceTags['table'].append;
              }

              if ((copy !== undefined) && (copy != '')) {
                  jQuery('<div>' + prepend + ' ' + copy + '.</div>').insertBefore(this);
                  jQuery('<div>' + appended + ' ' + '.</div>').insertBefore(this);
              }

              // TODO: processing the table contents
              //
              // if ((content !== undefined) && (content != '')) {
              //     jQuery('<div>' + ' ' + content + "</div>").insertBefore(this);
              // }

              jQuery(this).remove();
          });

          // jadams
          // Search for <carousel>, check for previous declared <div>
          // container that contains the title element and insert that
          // text if it exists and then remove the DOM object
          //
          jQuery(clone).find('carousel').addBack('carousel').each(function() {
            title = $(this).prev()[0].innerText;
            title_element = jQuery(this).prev();
            jQuery(title_element).remove();

            if (customTags['carousel']) {
              prepend   = customTags['carousel'].prepend
              appended  = customTags['carousel'].append;
            }
            else {
              prepend   = voiceTags['carousel'].prepend
              appended  = voiceTags['carousel'].append;
            }

            if ((title !== undefined) && (title != '')) {
              jQuery('<div>' + prepend + ' ' + title + '.</div>').insertBefore(this);
              jQuery('<div>' + appended + ' ' + '.</div>').insertBefore(this);
            }

            jQuery(this).remove();
          });

          // jadams
          // Search for <slider>, check for previous declared <div>
          // container that contains the title element and insert that
          // text if it exists and then remove the DOM object
          //
          jQuery(clone).find('slider').addBack('slider').each(function() {
            title = $(this).prev()[0].innerText;
            title_element = jQuery(this).prev();
            jQuery(title_element).remove();

            if (customTags['slider']) {
              prepend   = customTags['slider'].prepend
              appended  = customTags['slider'].append;
            }
            else {
              prepend   = voiceTags['slider'].prepend
              appended  = voiceTags['slider'].append;
            }

            if ((title !== undefined) && (title != '')) {
              jQuery('<div>' + prepend + ' ' + title + '.</div>').insertBefore(this);
              jQuery('<div>' + appended + ' ' + '.</div>').insertBefore(this);
            }

            jQuery(this).remove();
        });

          // jadams
          // Search for <gallery>, check for previous declared <div>
          // container that contains the title element and insert that
          // text if it exists and then remove the DOM object
          //
          jQuery(clone).find('gallery').addBack('gallery').each(function() {
            title = jQuery(this).prev()[0].innerText;
            title_element = jQuery(this).prev();
            jQuery(title_element).remove();

            if (customTags['gallery']) {
              prepend   = customTags['gallery'].prepend
              appended  = customTags['gallery'].append;
            }
            else {
              prepend   = voiceTags['gallery'].prepend
              appended  = voiceTags['gallery'].append;
            }

            if ((title !== undefined) && (title != '')) {
              jQuery('<div>' + prepend + ' ' + title + '.</div>').insertBefore(this);
              jQuery('<div>' + appended + ' ' + '.</div>').insertBefore(this);
            }

            jQuery(this).remove();

          });

          // jadams
          // Search for <slider>, check for <caption>, insert that
          // text if it exists and then remove the DOM object
          //
          jQuery(clone).find('lightbox').addBack('gallery').each(function() {
              title = jQuery(this).prev()[0].innerText;
              title_element = jQuery(this).prev();
              jQuery(title_element).remove();

              if (customTags['lightbox']) {
                prepend   = customTags['lightbox'].prepend
                appended  = customTags['lightbox'].append;
              }
              else {
                prepend   = voiceTags['lightbox'].prepend
                appended  = voiceTags['lightbox'].append;
              }

              if ((title !== undefined) && (title != '')) {
                jQuery('<div>' + prepend + ' ' + title + '.</div>').insertBefore(this);
                jQuery('<div>' + appended + ' ' + '.</div>').insertBefore(this);
              }

              jQuery(this).remove();
          });

          // Search for DOM object to be replaced specified in
          // the HTML with "data-speak2me-swap"
          //
          jQuery(clone).find('[data-speak2me-swap]').addBack('[data-speak2me-swap]').each(function() {
            copy = jQuery(this).data('speak2me-swap');
            jQuery(this).text(copy);
          });

          // Search for DOM object to spelled out specified in
          // the HTML with "data-speak2me-spell".
          // I find this function fun if, admittedly, not too practical.
          //
          jQuery(clone).find('[data-speak2me-spell]').addBack('[data-speak2me-spell]').each(function() {
              copy = jQuery(this).text();
              copy = copy.split('').join(' ');
              jQuery(this).text(copy);
          });
          return clone;
        }

        // jadams
        function cleanDOMelements(final) {
          var start,ended,speak,part1,part2,final;

          // Search for <speak2me> in comments, copy the text,
          // place it outside the comment, and then splice together
          // "final" string again, which omits the comment.
          //
          while (final.indexOf('<!-- <speak2me>') != -1) {
              start = final.indexOf('<!-- <speak2me>');
              ended = final.indexOf('</speak2me> -->', start);
              if (ended == -1) { break; }
              speak = final.substring(start + 17, ended);
              part1 = final.substring(0, start);
              part2 = final.substring(ended + 17);
              final = part1 + ' ' + speak + ' ' + part2;
          };

          // Strip out remaining comments.
          //
          final = final.replace(/<!--[\s\S]*?-->/g, '');

          // Strip out remaining HTML tags
          //
          final = final.replace(/(<([^>]+)>)/ig, '');

          // Replace a string of characters with another as specified
          // by "speak2me('replace')".
          //
          var len = replacements.length;
          var i = 0;
          var old, rep;
          while (i < len) {
              old = replacements[i];
              old = old.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
              rep = replacements[i + 1] + ' ';
              var regexp = new RegExp(old, 'gi');
              var final = final.replace(regexp, rep);
              i = i + 2;
          };

          // Replace double smart quotes with proper text, same as what
          // was done previously with <q>
          //
          if (customTags['q']) {
              final = final.replace(/“/g, customTags['q'].prepend + ' ');
              final = final.replace(/”/g, ' ' + customTags['q'].append);
          } else {
              final = final.replace(/“/g, voiceTags['q'].prepend + ' ');
              final = final.replace(/”/g, ' ' + voiceTags['q'].append);
          }

          // jadams
          // Replace colons ':' with a pause since
          // the browser doesn't do so when reading.
          //
          final = final.replace(/:/g, ', ');

          // jadams
          // Replace empty lines
          //
          final = final.replace(/^$/g, '\n');
          final = final.replace(/^\s+$/g, '\n');

          // jadams
          // Replace single full stops in line ' . ' or '. '
          //
          final = final.replace(/\s+\.\s+/g, '\n');
          final = final.replace(/\s+\.\s+$/g, '\n');

          // jadams
          // Replace strange double full stops '..'
          //
          final = final.replace(/\.\./g, '.');

          // jadams
          // Replace the abbreviation '.e.g.'or ',.e.g.,'
          //
          final = final.replace(/\se\.g\.\s/g, ' for example, ');
          final = final.replace(/\,\s+\.g\.\s+\,/g, ' for example, ');

          // jadams
          // Replace question and exclamation (?|!) marks
          //
          final = final.replace(/[\!\?]/g, ', ');

          // Replace em-dashes and double-dashes with a pause since
          // the browser doesn't do so when reading.
          //
          final = final.replace(/—/g, ', ');
          final = final.replace(/--/g, ', ');

          // When read from the DOM, a few special characters
          // (&amp; for example) display as their hex codes
          // rather than resolving into their actual character
          //
          var txt = document.createElement('textarea');
          txt.innerHTML = final;
          final = txt.value;

          // Strip out new line characters and carriage returns,
          // which cause unwanted pauses.
          //
          final = final.replace(/(\r\n|\n|\r)/gm, '');

          // Strip out multiple spaces and periods and commas
          // for neatness more than anything else since
          // none of this will affect the speech. But it helps when
          // checking progress in the console.
          //
          final = final.replace(/  +/g, ' ');
          final = final.replace(/\.\./g, '.');
          final = final.replace(/,,/g, ',');
          final = final.replace(/ ,/g, ',');
          final = final.replace(/^\s+|\s+$/g, '');

          // final = final.replace(/^\s+|\s+$/g,'\n');
          // final = final.replace(/\. /g, '. \n');

          // Definiere die Größe der Abschnitte
          const chunkSize = 100;

          // Teile den Text in Abschnitte auf
          const textChunks = splitTextIntoChunks(final, chunkSize);
          chunkCounterMax = textChunks.length;

          // return final;
          return textChunks;
        }

        // return the SpeechSynthesisUtterance object to be used
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

      // jadams
      stop: function() {
          window.speechSynthesis.cancel();
          userStoppedSpeaking = true;

          // jadams
          // NOTE: coincident active speech synthesis in multiple
          // browser windows (tabs) does NOT work
          //
          // user_session.speech_synthesis_active = false;
          // j1.writeCookie({
          //   name:     'user_session',
          //   data:     user_session,
          //   secure:   false,
          //   expires:  0
          // });

          return this;
      },

      enabled: function() {
          return ('speechSynthesis' in window);
      },

      isSpeaking: function() {
          return (window.speechSynthesis.speaking);
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
          };
          return this;
      },

      pitch: function() {
          var num = arguments[0];
          if ((num >= 0.1) && (num <= 2)) {
              pitchUserDefault = num;
          } else if (num === undefined) {
              pitchUserDefault = void 0;
              pitch = pitchDefault;
          };
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
          };
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
          };

          if (len == 2) {
            if (['img','table','figure'].indexOf(arguments[0]) == -1) {
              console.log("Error: When customizing, tag indicated must be either 'img', 'table', or 'figure'.");
              return;
            }
            customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString());
          };

          if (len == 3) {
            if (['q',"ol","ul","blockquote"].indexOf(arguments[0]) == -1) {
              console.log("Error: When customizing, tag indicated must be either 'q', 'ol', 'ul' or 'blockquote'.");
              return;
            }
            customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString(), arguments[2].toString());
          };

          return this;
      },

      getVoices: function() {
          // If no arguments, then the user has requested the array of
          // voices populated earlier.
          //
          if (arguments.length == 0) {
              return voices;
          };

          // If there's another argument, we'll assume it's a jQuery
          // selector designating where to put the dropdown menu.
          // And if there's a third argument, that will be custom text
          // for the dropdown menu.
          // Then we'll create a dropdown menu with the voice names and,
          //in parenthesis, the language code.
          //
          var obj = jQuery(arguments[0]);
          var selectionTxt = 'Choose a voice';

          if (arguments[1] !== undefined) {
              selectionTxt = arguments[1];
          }

          obj.append(jQuery("<select id='voiceSelect' name='voiceSelect'><option value='none'>" + selectionTxt + "</option></select>"));

          // jadams
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

              // set used voice as 'selected'
              if (voiceLanguageDefault !== undefined) {
                if ( voices[i].name ===  voiceLanguageDefault ) {
                  option.setAttribute('selected', 'selected');
                }
              } else {
                if ( voices[i].name.includes(voiceUserDefault) ) {
//                option.setAttribute('selected', 'selected');
                }
              }

              option.setAttribute('data-speak2me-language', voices[i].language);
              obj.find('select').append(option);
          }

          // jadams
          return i - skippedVoices;
      },

      setVoice: function() {
          // The setVoice function has to have two attributes
          // if not, exit the function.
          //
          if (arguments.length < 2) {
              return this
          }
          var requestedVoice, requestedLanguage;

          // User wants to change the voice directly. If that name indeed
          // exists, update the "voiceUserDefault" variable.
          //
          if (arguments[0] == 'name') {
              requestedVoice = arguments[1];
              for (var i = 0; i < voices.length; i++) {
                  if (voices[i].name == requestedVoice) {
                      voiceUserDefault = requestedVoice;
                  };
              };
          };

          // User wants to change the voice by only specifying the
          // first two characters of the language code. Case insensitive.
          //
          if (arguments[0] == 'language') {
              requestedLanguage = arguments[1].toUpperCase();
              if (requestedLanguage.length == 2) {
                  for (var i = 0; i < voices.length; i++) {
                      if (voices[i].language.substring(0,2).toUpperCase() == requestedLanguage) {
                          voiceUserDefault = voices[i].name;
                          break
                      };
                  };
              } else {
                  // User wants to change the voice by specifying the
                  // complete language code.
                  for (var i = 0; i < voices.length; i++) {
                      if (voices[i].language == requestedLanguage) {
                          voiceUserDefault = voices[i].name;
                          break
                      };
                  };
              }
          };
          return this;
      },
    };

    $.fn.speak2me = function(method) {
        if (methods[method]) {
            return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.speak.apply(this, arguments);
        } else {
            jQuery.error('Method ' +  method + ' does not exist on jQuery.speak2me');
        }
    };

}(jQuery));
