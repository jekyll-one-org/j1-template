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
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_defaults       = modules.defaults.cookies.defaults %}
{% assign cookie_settings       = modules.cookies.settings %}

{% assign advertising_defaults  = modules.defaults.advertising.defaults %}
{% assign advertising_settings  = modules.advertising.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_options        = cookie_defaults | merge: cookie_settings %}
{% assign advertising_options   = advertising_defaults | merge: advertising_settings %}

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
 #  Copyright (C) 2023 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Theme/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/
$(function () {

var dependencies_met_page_visible = setInterval (function (options) {
  var pageState     = $('#no_flicker').css("display");
  var pageVisible   = (pageState == 'block') ? true: false;

  if (j1.getState() === 'finished' && pageVisible) {
    {% if advertising %}

    var logger                = log4javascript.getLogger('j1.core.advertising.google');
    var cookie_names          = j1.getCookieNames();
    var user_consent          = j1.readCookie(cookie_names.user_consent);
    var providerID            = '{{advertising_options.google.publisherID}}';
    var validProviderID       = (providerID.includes('your')) ? false : true;
    var advertisingProvider   = 'Google Adsense';
    var advertisingDefaults   = $.extend({},   {{advertising_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
    var aadvertisingSettings  = $.extend({},   {{advertising_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
    var advertisingOptions    = $.extend(true, {}, advertisingDefaults, aadvertisingSettings);
    var ad_containers;
    var ads_found;

      // START create|loading adverting containers enabled
      ad_containers = advertisingOptions.google.ads;
      ad_containers.forEach(function (ad) {
        if (ad.enabled) {
          var currentDiv = document.getElementById(ad.id);
          var ins        = document.createElement('ins');

          currentDiv.appendChild(ins);
          var insID = 'ins_' + ad.id;
          ins.setAttribute('id', insID);
          ins.className = "adsbygoogle";

          document.getElementById(insID).setAttribute('style', ad.styles);
          document.getElementById(insID).setAttribute('data-ad-test', ad.test);
          document.getElementById(insID).setAttribute('data-ad-client', ad.publisherID);
          document.getElementById(insID).setAttribute('data-ad-slot', ad.slot);
          document.getElementById(insID).setAttribute('data-ad-format', ad.format);
          document.getElementById(insID).setAttribute('data-full-width-responsive', ad.responsive);

          logger.info('\n' + 'add settings on id: ' + ad.id);
        };

      });
      // END loading adverting containers

      ads_found = document.getElementsByClassName('adsbygoogle').length;
      if (ads_found) {
        logger.info('\n' + 'ads initialized in page (total): ' + ads_found);
        [].forEach.call(document.querySelectorAll('.adsbygoogle'), function() {
          (adsbygoogle = window.adsbygoogle || []).push({});
        });
      } else {
        logger.warn('\n' + 'no ads found in page');
      }

      var dependencies_met_page_ready = setInterval (function (options) {
      if (j1.getState() === 'finished') {

        if (!validProviderID) {
          logger.warn('\n' + 'disabled provider: ' + advertisingProvider);
          clearInterval(dependencies_met_page_ready);
          return false;
        }

        if (user_consent.personalization) {
          // logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
        } else {
          logger.warn('\n' + 'consent on cookies disabled for personalization');
          logger.warn('\n' + 'user consent on personalization: ' + user_consent.personalization);
          logger.warn('\n' + 'initializing all ads skipped');
        }
        clearInterval(dependencies_met_page_ready);
      }
    }, 25);

    {% else %}
    // [WARN   ] [j1.core.advertising                     ] [ no init code placed ]
    {% endif %}

    clearInterval(dependencies_met_page_visible);
  }
}, 25);

});

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
