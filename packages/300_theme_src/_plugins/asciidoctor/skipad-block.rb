# ------------------------------------------------------------------------------
# ~/_plugins/asciidoctor-extensions/skipad-video-selection-block.rb
# Asciidoctor extension for J1 Swiper (Slider)
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023-2025 Juergen Adams
#
# J1 Template is licensed under the MIT License.
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
# ------------------------------------------------------------------------------
require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'
include Asciidoctor

# ------------------------------------------------------------------------------
# A block macro that embeds a input/video-selection (parent) block
# into the output document
#
# Usage:
#
#   swiper::slider_id[role="additional classes"]
#
# Example:
#
#   .The slider title
#   swiper::image_slider[role="mt-3 mb-5"]
#
# ------------------------------------------------------------------------------
Asciidoctor::Extensions.register do

  class SkipAdBlockMacro < Extensions::BlockMacroProcessor
    use_dsl

    named :skipad
    name_positional_attributes 'role'
    default_attrs 'role' => 'mt-3 mb-3'

    def process parent, target, attributes

      title_html  = (attributes.has_key? 'title') ? %(<div class="video-title"> <i class="mdib mdib-video mdib-24px mr-2"></i> #{attributes['title']} </div>\n) : nil
      html        = %(
        <div class="#{attributes['role']}">
          #{title_html}
          <div id="#{target}_app" class="skipad-detection-app"></div>
        </div>
      )

      create_pass_block parent, html, attributes, subs: nil
    end
  end

  block_macro SkipAdBlockMacro
end
