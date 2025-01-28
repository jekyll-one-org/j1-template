# ------------------------------------------------------------------------------
# ~/_plugins/asciidoctor-extensions/youtube-block.rb
# Asciidoctor extension for YouTube Video
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023-2025 Juergen Adams
#
# J1 Template is licensed under the MIT License.
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
# ------------------------------------------------------------------------------

# Require RubyGems for managing yaml config files and data
# ------------------------------------------------------------------------------
require 'pathutil'
require 'fileutils'
require 'pathname'
require 'json'
require 'safe_yaml'

# Require Asciidoctor Eextensions
# ------------------------------------------------------------------------------
require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'
include Asciidoctor

# ------------------------------------------------------------------------------
# A block macro that embeds a video from the YouTube platform
# into the output document
#
# Usage:
#
#   youtube::video_id[poster="full_image_path" theme="vjs_theme_name" role="CSS classes"]
#
# Example:
#
#   .Video title
#   youtube::nV8UZJNBY6Y[poster="/assets/image/icons/videojs/videojs-poster.png" theme="city" role="mt-5 mb-5"]
#
# ------------------------------------------------------------------------------
# See:
# https://www.tutorialspoint.com/creating-a-responsive-video-player-using-video-js
# ------------------------------------------------------------------------------
# NOTE
# Bei YouTube Nocookie handelt es sich um einen Code zum
# Einbetten inklusive entsprechender URL, der es Webseitenbetreibern
# erlaubt, Videos ohne Tracking Cookies auf ihren Webseiten zu
# integrieren. Der Code muss für jedes eingebettete Video generiert
# und eingefügt werden.
#
# See: https://www.datenschutz.org/youtube-nocookie/
# ------------------------------------------------------------------------------

#current_path                = File.expand_path(Dir.getwd)
#default_config_path         = File.join(current_path, '/_data/modules/defaults')
#user_config_path            = File.join(current_path, '/_data/modules')

#videojs_config_file_name    = 'videojs.yml'
#videojs_default_config_file = File.join(default_config_path, videojs_config_file_name)
#videojs_user_config_file    = File.join(user_config_path, videojs_config_file_name)

#@videojsDefaultSettings     = YAML.safe_load_file(videojs_default_config_file)
#@videojsUserSettings        = YAML.safe_load_file(videojs_user_config_file)

#videojsSettings             = @videojsUserSettings['settings'].merge(@videojsDefaultSettings['defaults'])

# VideoJS config settings
# ------------------------------------------------------------------------------
#playbackRates               = videojsSettings['playbackRates']


Asciidoctor::Extensions.register do

  class YouTubeBlockMacro < Extensions::BlockMacroProcessor
    use_dsl

    named :youtube
    name_positional_attributes 'poster', 'theme', 'custom_buttons', 'role'
    default_attrs 'poster' => '/assets/image/icons/videojs/videojs-poster.png',
                  'theme' => 'uno',
                  'custom_buttons' => true,
                  'role' => 'mt-3 mb-3'

    def process parent, target, attributes

      chars           = [('a'..'z'), ('A'..'Z'), ('0'..'9')].map(&:to_a).flatten
      video_id        = (0...11).map { chars[rand(chars.length)] }.join

      title_html      = (attributes.has_key? 'title') ? %(<div class="video-title"> <i class="mdib mdib-video mdib-24px mr-2"></i> #{attributes['title']} </div>\n) : nil
      poster_image    = (poster = attributes['poster']) ? %(#{poster}) : nil
      theme_name      = (theme  = attributes['theme'])  ? %(#{theme}) : nil
      custom_buttons  = (custom_buttons = attributes['custom_buttons']) ? %(#{custom_buttons}) : nil

      html = %(
        <div class="youtube-player bottom #{attributes['role']}">
          #{title_html}
          <video
            id="#{video_id}"
            class="video-js vjs-theme-#{theme_name}"
            controls
            width="640" height="360"
            poster="#{poster_image}"
            alt="#{attributes['title']}"
            aria-label="#{attributes['title']}"
            data-setup='{
              "fluid" : true,
              "techOrder": [
                "youtube", "html5"
              ],
              "sources": [{
                "type": "video/youtube",
                "src": "//youtube.com/watch?v=#{target}"
              }],
              "controlBar": {
                "pictureInPictureToggle": false,
                "volumePanel": {
                  "inline": false
                }
              }
            }'
          > </video>
        </div>

        <script>
          $(function() {

            function addCaptionAfterImage(imageSrc) {
              const image = document.querySelector(`img[src="${imageSrc}"]`);

              if (image) {
                // create div|caption container
                const newDiv = document.createElement('div');
                newDiv.classList.add('caption');
                newDiv.textContent = '#{attributes['title']}';

                // insert div|caption container AFTER the image
                image.parentNode.insertBefore(newDiv, image.nextSibling);
              } else {
                console.error(`Kein Bild mit src="${imageSrc}" gefunden.`);
              }
            }

            var dependencies_met_page_ready = setInterval (function (options) {
              var pageState      = $('#content').css("display");
              var pageVisible    = (pageState == 'block') ? true : false;
              var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

              if (j1CoreFinished && pageVisible) {
                addCaptionAfterImage('#{poster_image}');

                // scroll to player top position
                // -------------------------------------------------------------
                var vjs_player = document.getElementById("#{video_id}");

                vjs_player.addEventListener('click', function(event) {
                  event.preventDefault();
                  event.stopPropagation();

                  var scrollOffset = (window.innerWidth >= 720) ? -130 : -110;

                  // scroll player to top position
                  const targetDiv         = document.getElementById("#{video_id}");
                  const targetDivPosition = targetDiv.offsetTop;
                  window.scrollTo(0, targetDivPosition + scrollOffset);
                }); // END EventListener 'click'

                clearInterval(dependencies_met_page_ready);
              }
            }, 10);

            // set custom controls on vjs player
            // -----------------------------------------------------------------
            var dependencies_met_vjs_player_exist = setInterval (function (options) {
              var vjsPlayerExist          = document.getElementById("#{video_id}") ? true : false;
              var vjsPlayerCustomButtons  = ("#{custom_buttons}" === 'true') ? true : false;

              if (vjsPlayerExist && vjsPlayerCustomButtons) {

                // apply custom controls on event 'player ready'
                videojs("#{video_id}").ready(function() {
                  var vjsPlayer = this;

                  // add playbackRates
                  //
                  vjsPlayer.playbackRates([0.25, 0.5, 1, 1.5, 2]);
  
                  // add autoCaption plugin
                  //
                  vjsPlayer.autoCaption({
                    enabled: true,
                  });
                  // END autoCaption plugin

                  // add hotKeys plugin
                  //
                  vjsPlayer.hotKeys({
                    enabled: true,
                    volumeStep: 0.1,
                    seekStep: 15,
                    enableMute: true,
                    enableFullscreen: true,
                    enableNumbers: false,
                    enableVolumeScroll: true,
                    enableHoverScroll: true,
                    alwaysCaptureHotkeys: true,
                    captureDocumentHotkeys: true,
                    documentHotkeysFocusElementFilter: e => e.tagName.toLowerCase() === "body",
  
                    // Mimic VLC seek behavior (default to: 15)
                    //
                    seekStep: function(e) {
                      if (e.ctrlKey && e.altKey) {
                        return 5*60;
                      } else if (e.ctrlKey) {
                        return 60;
                      } else if (e.altKey) {
                        return 10;
                      } else {
                        return 15;
                      }
                    },
  
                    // Enhance existing simple hotkey with a complex hotkey
                    fullscreenKey: function(e) {
                      // fullscreen with the F key or Ctrl+Enter
                      return ((e.which === 70) || (e.ctrlKey && e.which === 13));
                    }                 
                  }); // END hotkeys plugin
  
                  // add skipButtons plugin
                  //
                  vjsPlayer.skipButtons({
                    enabled:  true,
                    forward:  10,
                    backward: 10
                  }); // END skipButtons plugin                
  
                }); // END player ready (set custom controls)

                clearInterval(dependencies_met_vjs_player_exist);
              } // END if 'vjsPlayerExist'

            }, 10); // END 'dependencies_met_vjs_player_exist'

          }); // END 'document ready'

        </script>
      )

      create_pass_block parent, html, attributes, subs: nil
    end
  end

  block_macro YouTubeBlockMacro
end
