---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/data/disqus.js
 # Liquid PROCEDURE to generate the JS portion used by J1 Connector Disqus
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #   liquid_var: {{ liquid_var | debug }}
 #   config: {{ config | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment     = site.environment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign modules         = site.data.modules %}
{% assign j1_config       = site.data.j1_config %}

{% comment %} Set variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comment_provider = 'hyvor' %}
{% assign site_id          = j1_config.comments.hyvor.site_id %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

{% comment %} Main
================================================================================ {% endcomment %}

$(document).ready(function() {
  var dependencies_met_page_finished = setInterval (function () {
    if (j1.getState() === 'finished') {
      // DON'T EDIT BELOW THIS LINE
      // -----------------------------------------------------------------------
      var site_id = {{site_id}};
      (function() {
        var HYVOR_TALK_WEBSITE = site_id;
        var HYVOR_TALK_CONFIG = {
            url: false,
            id: false
        };
      })();
    }
    clearInterval(dependencies_met_page_finished);
  }, 25);
});

{% endcapture %}

{{ cache | strip_empty_lines }}
{% assign cache = nil %}
