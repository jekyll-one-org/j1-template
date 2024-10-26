/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/youtube.js
 # AmplitudeJS V5 Plugin|Tech for J1 Template
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";

var ytPlayer;
var ytPlayerReady   = false;
var ytApiIReady     = false;
var logger          = log4javascript.getLogger('j1.adapter.amplitude.tech');
var ytpSettings     = {
  ytpVideoID:   "qEhzpBJpUq0",
  ytpAutoPlay:  0,
  ytpLoop:      1
};

// date|time monitoring
//---------------------
var startTime;
var endTime;
var startTimeModule;
var endTimeModule;
var timeSeconds;

startTimeModule = Date.now();

logger.info('\n' + 'Initialize YouTube IframeAPI: started');

// load the IFrame Player API code asynchronously
//
var firstScriptTag;
var tag         = document.createElement('script');
tag.id          = 'iframe_api';
tag.src         = '//youtube.com/iframe_api';
firstScriptTag  = document.getElementsByTagName('script')[0];

firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Create an <iframe> (and the YouTube player) after the YT API code
// has been downloaded
function onYouTubeytApiIReady() {
  ytApiIReady = true;

  // logger.info('\n' + 'AJS YouTube IframeAPI: ready');

  // var ytCtrl            = document.getElementById("youtube_player_container");
  // ytCtrl.innerHTML      = '<img id="youtube-icon1 src=""/> <div id="ytPlayer"></div>';
  // ytCtrl.style.cssText  = 'width:150px;margin:2em auto;cursor:pointer;cursor:hand;display:none';
  // ytCtrl.onclick = toggleAudio1;

  ytPlayer = new YT.Player('ytPlayer', {
    height:             0,
    width:              0,
    videoId:            ytpSettings.ytpVideoID,
    playerVars: {
      autoplay:         ytpSettings.ytpAutoPlay,
      loop:             ytpSettings.ytpLoop
    },
    events: {
      onReady:          onPlayerReady,
      onStateChange:    onPlayerStateChange
    }
  });

  // save player reference for later use
  j1.adapter.amplitude['ytPlayer']     = ytPlayer;
  j1.adapter.amplitude['ytApiIReady']  = ytApiIReady;

  logger.info('\n' + 'Initialize YouTube API: finished');
  endTimeModule = Date.now();
  logger.info('\n' + 'YouTube API initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

} // END onYouTubeytApiIReady

function onPlayerReady(event) {
  logger.info('\n' + 'YouTube Player: ready');
  ytPlayer.setPlaybackQuality("small");
  j1.adapter.amplitude['ytPlayerReady']  = true;

  // document.getElementById("youtube-audio").style.display = "block";
  // togglePlayButton1(ytPlayer.getPlayerState() !== 5);
} // END event onPlayerReady

function onPlayerStateChange(event) {
  if (event.data === 0) {
    var bla = 'blupp'
    // togglePlayButton1(false);
  }
} // END event onPlayerStateChange

// Create a new div element
const ytpContainer = document.createElement('div');

// Set attributes for the div container
ytpContainer.id = 'youtube_player_container';
//    ytpContainer.className = 'container';
//    ytpContainer.setAttribute("data-video", "WxcWO9O4DSM");
//    ytpContainer.setAttribute("data-autoplay", "0");
//    ytpContainer.setAttribute("data-loop", "1");
//    ytpContainer.innerHTML = 'data-video="WxcWO9O4DSM" data-autoplay="0" data-loop="1"';

// Append the div container to the end of the body
document.body.appendChild(ytpContainer);
