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
  function ytAudio() {
  }

  // 2. This code loads the IFrame Player API code asynchronously.
  var player1, player2, player3, player4;
  var firstScriptTag;

  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // 3. This function creates an <iframe> (and YouTube player)
  //    after the API code downloads.
  function onYouTubeIframeAPIReady() {

    var ctrlq1 = document.getElementById("youtube-audio1");
    ctrlq1.innerHTML = '<img id="youtube-icon1" src=""/><div id="youtube-player1"></div>';
    ctrlq1.style.cssText = 'width:150px;margin:2em auto;cursor:pointer;cursor:hand;display:none';
    ctrlq1.onclick = toggleAudio1;

    player1 = new YT.Player('youtube-player1', {
      height: '0',
      width: '0',
      videoId: ctrlq1.dataset.video,
      playerVars: {
        autoplay: ctrlq1.dataset.autoplay,
        loop: ctrlq1.dataset.loop,
      },
      events: {
        'onReady': onPlayerReady1,
        'onStateChange': onPlayerStateChange1
      }
    });

    var ctrlq2 = document.getElementById("youtube-audio2");
    ctrlq2.innerHTML = '<img id="youtube-icon2" src=""/><div id="youtube-player2"></div>';
    ctrlq2.style.cssText = 'width:150px;margin:2em auto;cursor:pointer;cursor:hand;display:none';
    ctrlq2.onclick = toggleAudio2;

    player2 = new YT.Player('youtube-player2', {
      height: '0',
      width: '0',
      videoId: ctrlq2.dataset.video,
      playerVars: {
        autoplay: ctrlq2.dataset.autoplay,
        loop: ctrlq2.dataset.loop,
      },
      events: {
        'onReady': onPlayerReady2,
        'onStateChange': onPlayerStateChange2
      }
    });

    var ctrlq3 = document.getElementById("youtube-audio3");
    ctrlq3.innerHTML = '<img id="youtube-icon3" src=""/><div id="youtube-player3"></div>';
    ctrlq3.style.cssText = 'width:150px;margin:2em auto;cursor:pointer;cursor:hand;display:none';
    ctrlq3.onclick = toggleAudio3;

    player3 = new YT.Player('youtube-player3', {
      height: '0',
      width: '0',
      videoId: ctrlq3.dataset.video,
      playerVars: {
        autoplay: ctrlq3.dataset.autoplay,
        loop: ctrlq3.dataset.loop,
      },
      events: {
        'onReady': onPlayerReady3,
        'onStateChange': onPlayerStateChange3
      }
    });

    var ctrlq4 = document.getElementById("youtube-audio4");
    ctrlq4.innerHTML = '<img id="youtube-icon4" src=""/><div id="youtube-player4"></div>';
    ctrlq4.style.cssText = 'width:150px;margin:2em auto;cursor:pointer;cursor:hand;display:none';
    ctrlq4.onclick = toggleAudio4;

    player4 = new YT.Player('youtube-player4', {
      height: '0',
      width: '0',
      videoId: ctrlq4.dataset.video,
      playerVars: {
        autoplay: ctrlq4.dataset.autoplay,
        loop: ctrlq4.dataset.loop,
      },
      events: {
        'onReady': onPlayerReady4,
        'onStateChange': onPlayerStateChange4
      }
    });
  }

  function togglePlayButton1(play) {
    document.getElementById("youtube-icon1").src = play ? "/assets/theme/j1/modules/amplitudejs/icons/player/blue/play.png" : "/assets/theme/j1/modules/amplitudejs/icons/player/blue/pause.png";
  }

  function toggleAudio1() {
    if ( player1.getPlayerState() == 1 || player1.getPlayerState() == 3 ) {
      player1.pauseVideo();
      togglePlayButton1(false);
    } else {
      player1.playVideo();
      togglePlayButton1(true);
    }
  }

  function togglePlayButton2(play) {
    document.getElementById("youtube-icon2").src = play ? "/assets/theme/j1/modules/amplitudejs/icons/player/blue/play.png" : "/assets/theme/j1/modules/amplitudejs/icons/player/blue/pause.png";
  }

  function toggleAudio2() {
    if ( player2.getPlayerState() == 1 || player2.getPlayerState() == 3 ) {
      player2.pauseVideo();
      togglePlayButton2(false);
    } else {
      player2.playVideo();
      togglePlayButton2(true);
    }
  }

  function togglePlayButton3(play) {
    document.getElementById("youtube-icon3").src = play ? "/assets/theme/j1/modules/amplitudejs/icons/player/blue/play.png" : "/assets/theme/j1/modules/amplitudejs/icons/player/blue/pause.png";
  }

  function toggleAudio3() {
    if ( player3.getPlayerState() == 1 || player3.getPlayerState() == 3 ) {
      player3.pauseVideo();
      togglePlayButton3(false);
    } else {
      player3.playVideo();
      togglePlayButton3(true);
    }
  }

  function togglePlayButton4(play) {
    document.getElementById("youtube-icon4").src = play ? "/assets/theme/j1/modules/amplitudejs/icons/player/blue/play.png" : "/assets/theme/j1/modules/amplitudejs/icons/player/blue/pause.png";
  }

  function toggleAudio4() {
    if ( player4.getPlayerState() == 1 || player4.getPlayerState() == 3 ) {
      player4.pauseVideo();
      togglePlayButton4(false);
    } else {
      player4.playVideo();
      togglePlayButton4(true);
    }
  }

  function onPlayerReady1(event) {
    player1.setPlaybackQuality("small");
    document.getElementById("youtube-audio1").style.display = "block";
    togglePlayButton1(player1.getPlayerState() !== 5);
  }

  function onPlayerStateChange1(event) {
    if (event.data === 0) {
      togglePlayButton1(false);
    }
  }

  function onPlayerReady2(event) {
    player2.setPlaybackQuality("small");
    document.getElementById("youtube-audio2").style.display = "block";
    togglePlayButton2(player2.getPlayerState() !== 5);
  }

  function onPlayerStateChange2(event) {
    if (event.data === 0) {
      togglePlayButton2(false);
    }
  }

  function onPlayerReady3(event) {
    player3.setPlaybackQuality("small");
    document.getElementById("youtube-audio3").style.display = "block";
    togglePlayButton3(player3.getPlayerState() !== 5);
  }

  function onPlayerStateChange3(event) {
    if (event.data === 0) {
      togglePlayButton3(false);
    }
  }

  function onPlayerReady4(event) {
    player4.setPlaybackQuality("small");
    document.getElementById("youtube-audio4").style.display = "block";
    togglePlayButton4(player4.getPlayerState() !== 5);
  }

  function onPlayerStateChange4(event) {
    if (event.data === 0) {
      togglePlayButton4(false);
    }
  }
