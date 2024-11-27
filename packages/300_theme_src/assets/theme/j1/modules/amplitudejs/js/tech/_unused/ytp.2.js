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

// Load the IFrame Player API code asynchronously
// -----------------------------------------------------------------------------

 // date|time monitoring
  //----------------------------------------------------------------------------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

// YT player settings
// -----------------------------------------------------------------------------
const YT_PLAYER_STATE = {
  not_started:        -1,
  ended:               0,
  playing:             1,
  paused:              2,
  buffering:           3,
  video_cued:          5
};

// YT API settings
// -----------------------------------------------------------------------------
var firstScriptTag;
var ytPlayer;
var ytPlayerReady   = false;
var ytApiReady      = false;
var logger          = log4javascript.getLogger('j1.adapter.amplitude.tech');

var ytpSettings     = {
  ytpVideoID:       "qEhzpBJpUq0",
  ytpAutoPlay:      0,
  ytpLoop:          1
};


// -----------------------------------------------------------------------------
// main
// -----------------------------------------------------------------------------

startTimeModule = Date.now();

logger.info('\n' + 'Initialize plugin|tech (ytp) : started');

var tag         = document.createElement('script');
tag.src         = "//youtube.com/iframe_api";
firstScriptTag  = document.getElementsByTagName('script')[0];

firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Create an <iframe> after the API code has been downloaded
// -----------------------------------------------------------------------------
function onYouTubeIframeAPIReady() {
  ytApiReady = true;

  logger.info('\n' + 'AJS YouTube iFrame API: ready');

  // create the YT Player div (hidden)  
  var ytpContainer = document.getElementById("mimi_rutherfurt_yt_large_yt_video");
  ytpContainer.innerHTML = '<div id="youtube-ytPlayer"></div>';
  ytpContainer.style.cssText = 'display:none';

  ytPlayer = new YT.Player('youtube-ytPlayer', {
    height:             '0',
    width:              '0',
    videoId:            ytpSettings.ytpVideoID,
    playerVars: {
      autoplay:         ytpSettings.ytpAutoPlay,
      loop:             ytpSettings.ytpLoop
    },
    events: {
      'onReady':        onPlayerReady,
      'onStateChange':  onPlayerStateChange
    }
  });

  // save YT API state for later use
  j1.adapter.amplitude['ytApiReady']  = ytApiReady;

}


function toggleAudio() {
  if (ytPlayer.getPlayerState() === YT_PLAYER_STATE.playing || ytPlayer.getPlayerState() === YT_PLAYER_STATE.buffering) {
    ytPlayer.pauseVideo();
    togglePlayButton(false);
  } else {
    ytPlayer.playVideo();
    togglePlayButton(true);
  }
}


function onPlayerReady(event) {
  logger.info('\n' + 'AJS YouTube Player: ready');

  // save player references for later use
  j1.adapter.amplitude['ytPlayerReady'] = true;
  j1.adapter.amplitude['ytPlayer']      = ytPlayer; 

  // additional YT player settings
  ytPlayer.setPlaybackQuality('small');

  endTimeModule = Date.now();
  logger.info('\n' + 'Initialize plugin|tech (ytp) : finished');
  logger.info('\n' + 'plugin|tech initializing time: ' + (endTimeModule-startTimeModule) + 'ms');
}

function onPlayerStateChange(event) {
  if (event.data === 0) {
    togglePlayButton(false);
  }
}


// -----------------------------------------------------------------------------
// Mimik Amplitude player buttons (events)
// -----------------------------------------------------------------------------
var largePlayerSkipForwardButtons   = document.getElementsByClassName("large-player-skip-forward");
var largePlayerSkipBackwardButtons  = document.getElementsByClassName("large-player-skip-backward");
var largePlayerPlayPauseButton      = document.getElementById('large_player_play_pause');

// Amplitude play|pause button
// -----------------------------------------------------------------------------
function togglePlayButton(play) {

  for (var i=0; i<largePlayerPlayPauseButton.length; i++) {
    if (largePlayerPlayPauseButton[i].id === 'skip-forward_{{player.id}}') {
      if (largePlayerSkilargePlayerPlayPauseButtonpForwardButtons[i].dataset.amplitudeSource === 'youtube') {
        // toggle Amplitude play button
        if (largePlayerPlayPauseButton && largePlayerPlayPauseButton.getAttribute("data-amplitude-source") === 'youtube') {
          largePlayerPlayPauseButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (largePlayerPlayPauseButton.classList.contains('amplitude-paused')) {
              largePlayerPlayPauseButton.classList.remove('amplitude-paused');
              largePlayerPlayPauseButton.classList.add('amplitude-playing');
            } else {
              largePlayerPlayPauseButton.classList.remove('amplitude-playing');
              largePlayerPlayPauseButton.classList.add('amplitude-paused');
            }
          });
        } // END if largePlayerPlayPauseButton (AJS Player)
      }
    }
  } // END for

  // Amplitude skip forward|backward button
  // ---------------------------------------------------------------------------
  for (var i=0; i<largePlayerSkipForwardButtons.length; i++) {
    if (largePlayerSkipForwardButtons[i].id === 'skip-forward_{{player.id}}') {
      if (largePlayerSkipForwardButtons[i].dataset.amplitudeSource === 'youtube') {
        largePlayerSkipForwardButtons[i].addEventListener('click', function(event) {
          var ytPlayer     = j1.adapter.amplitude['ytPlayer'];
          var currentTime  = ytPlayer.getCurrentTime();
          const skipOffset = parseFloat(playerForwardBackwardSkipSeconds);
          
          ytPlayer.seekTo(currentTime + skipOffset, true)

          //const duration    = Amplitude.getSongDuration();
          //const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
          //const targetTime  = parseFloat(currentTime + skipOffset);

          // if (currentTime > 0) {
          //   Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
          // }
        }); // END Listener 'click' SkipForwardButtons (AJS Player)
      } // END if largePlayerSkipForwardButtons (AJS Player)
    }
  } // END for

} // END togglePlayButton
