---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/advertising/js/google/adInitializer.js
 # Liquid template for Google Adsense to initialze all units in a page
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign asset_path        = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config       = site.data.j1_config %}
{% assign blocks                = site.data.blocks %}
{% assign modules               = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_defaults       = modules.defaults.cookies.defaults %}
{% assign cookie_settings       = modules.cookies.settings %}

{% assign advertising_options   = modules.defaults.advertising.defaults %}
{% assign advertising_settings  = modules.advertising.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_options        = cookie_defaults | merge: cookie_settings %}
{% assign advertising_options   = advertising_options | merge: advertising_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign advertising           = advertising_options.enabled %}
{% assign advertising_provider  = advertising_options.provider %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/advertising/js/google/adInitializer.js
 # JS helper for Google Adsense to initialze all units in a page
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

$(document).ready(function() {
  // [INFO   ] [j1.adapter.advertising                  ] [ detected advertising provider: {{advertising_provider}}} ]
  // [INFO   ] [j1.adapter.advertising                  ] [ advertising detected as: {{advertising}} ]
  {% if advertising %}
  var logger              = log4javascript.getLogger('j1.core.advertising.google');
  var ads_found           = document.getElementsByClassName('adsbygoogle').length;
  var cookie_names        = j1.getCookieNames();
  var user_consent        = j1.readCookie(cookie_names.user_consent);
  var providerID          = '{{advertising_options.google.publisherID}}';
  var validProviderID     = (providerID.includes('your')) ? false : true;
  var advertisingProvider = 'Google Adsense';

  var dependencies_met_page_ready = setInterval (function (options) {
    if (j1.getState() === 'finished') {

      if (!validProviderID) {
        logger.warn('\n' + 'disabled provider: ' + advertisingProvider);
        clearInterval(dependencies_met_page_ready);
        return false;
      }

      if (user_consent.personalization) {
        if (ads_found) {
          logger.info('\n' + 'initialize all ads in page: #' + ads_found);
          [].forEach.call(document.querySelectorAll('.adsbygoogle'), function() {
            (adsbygoogle = window.adsbygoogle || []).push({});
          });
        } else {
          logger.warn('\n' + 'no ads found in page');
        }
      } else {
        logger.warn('\n' + 'initializing ads skipped');
        logger.warn('\n' + 'consent on cookies disabled for personalization');
      }
      clearInterval(dependencies_met_page_ready);
    }
  }, 25);
  {% else %}
  // [WARN   ] [j1.core.advertising                     ] [ no init code placed ]
  {% endif %}
});

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
