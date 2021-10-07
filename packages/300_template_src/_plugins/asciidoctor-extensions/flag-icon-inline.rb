# ------------------------------------------------------------------------------
# ~/_plugins/asciidoctor-extensions/mdi-icon-inline.rb
# Asciidoctor extension for J1 Template
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2021 Juergen Adams
#
# J1 Template is licensed under the MIT License.
# See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
# ------------------------------------------------------------------------------
# <i class="flag-icon flag-icon-gr"></i>
# <i class="flag-icon flag-icon-gr flag-icon-squared"></i>
# ------------------------------------------------------------------------------

require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'
include Asciidoctor

Asciidoctor::Extensions.register do
  class FlagIconInlineMacro < Extensions::InlineMacroProcessor
    use_dsl
    named :flag
    name_positional_attributes 'style', 'size', 'modifier'
    default_attrs 'style' => 'rectangle', 'size' => '', 'modifier' => ''

    def process parent, target, attributes
      doc = parent.document
      style_class = (style = attributes['style']) ? %(#{style}) : nil
      size_class = (size = attributes['size']) ? %(size-#{size}) : nil
      modifier_class = (modifier = attributes['modifier']) ? %(#{modifier}) : nil
      country_name = target.tr '_', '-'
      %(<i class="flag-icon flag-icon-#{country_name} #{style_class} #{size_class} #{modifier}"></i>)
    end
  end
  inline_macro FlagIconInlineMacro
end
