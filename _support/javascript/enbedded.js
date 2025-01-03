

	$(function () {
        var videojsDefaultConfigJson = '{"description":{"title":"J1 VideoJS","scope":"Default settings","location":"_data/modules/defaults/videojs.yml"},"defaults":{"playbackRates":{"enabled":false,"values":[0.25,0.5,1,1.5,2]},"players":{"youtube":{"autoplay":0,"cc_load_policy":0,"controls":0,"disablekb":1,"enablejsapi":1,"fs":0,"iv_load_policy":3,"loop":0,"modestbranding":1,"rel":0,"showinfo":0,"default_poster":"/assets/image/icons/videojs/videojs-poster.png","poster":"maxresdefault.jpg","end":true,"start":true}},"plugins":{"autoCaption":{"enabled":false},"hotKeys":{"enabled":false,"seekStep":15,"volumeStep":0.1,"alwaysCaptureHotkeys":true,"captureDocumentHotkeys":false,"hotkeysFocusElementFilter":"function () { return false }","enableFullscreen":true,"enableHoverScroll":true,"enableInactiveFocus":true,"enableJogStyle":false,"enableMute":true,"enableModifiersForNumbers":true,"enableNumbers":false,"enableVolumeScroll":true,"skipInitialFocus":false},"skipButtons":{"enabled":false,"surroundPlayButton":false,"backwardIndex":1,"forwardIndex":1,"forward":10,"backward":10},"zoomButtons":{"enabled":false,"moveX":0,"moveY":0,"rotate":0,"zoom":1}}}}';
        var videojsUserConfigJson = '{"description":{"title":"J1 VideoJS","scope":"User settings","location":"_data/modules/videojs.yml"},"settings":{"playbackRates":{"enabled":true},"plugins":{"hotKeys":{"enabled":true,"enableInactiveFocus":false},"skipButtons":{"enabled":true,"surroundPlayButton":true},"zoomButtons":{"enabled":true}}}}';
        var videojsDefaultSettings = JSON.parse(videojsDefaultConfigJson);
        var videojsUserSettings = JSON.parse(videojsUserConfigJson);
        var videojsConfig = $.extend(true, {}, videojsDefaultSettings.defaults, videojsUserSettings.settings);
        const vjsPlayerType = 'native';
        const vjsPlaybackRates = videojsConfig.playbackRates.values;
        const piAutoCaption = videojsConfig.plugins.autoCaption;
        const piHotKeys = videojsConfig.plugins.hotKeys;
        const piSkipButtons = videojsConfig.plugins.skipButtons;
        const piZoomButtons = videojsConfig.plugins.zoomButtons;

        function addCaptionAfterImage(imageSrc) {
            const image = document.querySelector(`img[src="${imageSrc}"]`);
            if (image) {
                const newDiv = document.createElement('div');
                newDiv.classList.add('caption');
                newDiv.textContent = 'Gast Laura Wotorra';
                image.parentNode.insertBefore(newDiv, image.nextSibling);
            } else {
                console.error(`Kein Bild mit src="${imageSrc}" gefunden.`);
            }
        }
        var dependencies_met_page_ready = setInterval(function (options) {
                var pageState = $('#content').css("display");
                var pageVisible = (pageState == 'block') ? true : false;
                var j1CoreFinished = (j1.getState() === 'finished') ? true : false;
                if (j1CoreFinished && pageVisible) {
                    var vjs_player = document.getElementById("3CLYjFNhYWH");
                    var appliedOnce = false;
                    if ('true' === 'true') {
                    addCaptionAfterImage('/assets/video/gallery/straeter-laura-wontorra.jpg');
                    }
                    videojs("3CLYjFNhYWH").ready(function () {
                    var vjsPlayer = this;
                    if (videojsConfig.playbackRates.enabled) {
                        vjsPlayer.playbackRates(vjsPlaybackRates);
                    }
                    if (piHotKeys.enabled) {
                        vjsPlayer.hotKeys({
                            volumeStep: piHotKeys.volumeStep,
                            seekStep: piHotKeys.seekStep,
                            enableMute: piHotKeys.enableMute,
                            enableFullscreen: piHotKeys.enableFullscreen,
                            enableNumbers: piHotKeys.enableNumbers,
                            enableVolumeScroll: piHotKeys.enableVolumeScroll,
                            enableHoverScroll: piHotKeys.enableHoverScroll,
                            alwaysCaptureHotkeys: piHotKeys.alwaysCaptureHotkeys,
                            captureDocumentHotkeys: piHotKeys.captureDocumentHotkeys,
                            documentHotkeysFocusElementFilter: e => e.tagName.toLowerCase() === "body",
                            seekStep: function (e) {
                                if (e.ctrlKey && e.altKey) {
                                return 5 * 60;
                                } else if (e.ctrlKey) {
                                return 60;
                                } else if (e.altKey) {
                                return 10;
                                } else {
                                return 15;
                                }
                            },
                            fullscreenKey: function (e) {
                                return ((e.which === 70) || (e.ctrlKey && e.which === 13));
                            },
                        });
                    }
                    if (piSkipButtons.enabled) {
                        var backwardIndex = piSkipButtons.backward;
                        var forwardIndex = piSkipButtons.forwardIndex;
                        if (piSkipButtons.surroundPlayButton) {
                            var backwardIndex = 0;
                            var forwardIndex = 1;
                        }
                        vjsPlayer.skipButtons({
                            backwardIndex: backwardIndex,
                            forwardIndex: forwardIndex,
                            backward: piSkipButtons.backward,
                            forward: piSkipButtons.forward,
                        });
                    }
                    if (piZoomButtons.enabled && vjsPlayerType === 'native') {
                        vjsPlayer.zoomButtons({
                            moveX: piZoomButtons.moveX,
                            moveY: piZoomButtons.moveY,
                            rotate: piZoomButtons.rotate,
                            zoom: piZoomButtons.zoom
                        });
                    }
                    vjsPlayer.on("play", function () {
                        var startFromSecond = new Date('1970-01-01T' + "00:04:00" + 'Z').getTime() / 1000;
                        if (!appliedOnce) {
                            vjsPlayer.currentTime(startFromSecond);
                            appliedOnce = true;
                        }
                    });
                });
                var vjs_player = document.getElementById("3CLYjFNhYWH");
                    vjs_player.addEventListener('click', function (event) {
                    const targetDiv = document.getElementById("3CLYjFNhYWH");
                    const targetDivPosition = targetDiv.offsetTop;
                    var scrollOffset = (window.innerWidth >= 720) ? -130 : -110;
                    window.scrollTo(0, targetDivPosition + scrollOffset);
                }); // END EventListener 'click'

                clearInterval(dependencies_met_page_ready);
            }
        }, 10);
    });
