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
 # Copyright (C) 2021 Juergen Adams
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
{% assign comment_provider = 'disqus' %}
{% assign site_id          = j1_config.comments.disqus.site_id %}

{% comment %} Main
================================================================================ {% endcomment %}

$(document).ready(function() {
  var dependencies_met_page_finished = setInterval (function () {
    if (j1.getState() === 'finished') {
      var disqus_shortname = '{{site_id}}';
      // -----------------------------------------------------------------
      // RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE
      // SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
      // LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT:
      // https://disqus.com/admin/universalcode/#configuration-variables
      // -----------------------------------------------------------------
      //
      // var disqus_config = function () {
      // this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
      // Replace PAGE_IDENTIFIER with your page's unique
      // identifier variable
      // this.page.identifier = PAGE_IDENTIFIER;
      // };
      //
      // DON'T EDIT BELOW THIS LINE
      // -----------------------------------------------------------------
      (function() {
          var d = document,
              s = d.createElement('script');
          s.src = '//' + disqus_shortname + '.disqus.com/embed.js';
          s.setAttribute('data-timestamp', +new Date());
          (d.head || d.body).appendChild(s);
      })();
      clearInterval(dependencies_met_page_finished);
    }
  }, 25);
});

{% endcapture %}

{{ cache | strip_empty_lines }}
{% assign cache = nil %}
