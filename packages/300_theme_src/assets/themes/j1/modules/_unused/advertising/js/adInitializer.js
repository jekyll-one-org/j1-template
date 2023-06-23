---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/advertising/js/adInitializer.js
 # Liquid template to initialze all ad units in a page
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
{% assign environment           = site.environment %}
{% assign asset_path            = "/assets/themes/j1" %}

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
 # ~/assets/themes/j1/modules/advertising/js/adInitializer.js
 # JS helper to initialze all ad units in a page
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
    var contentState    = $('#content').css("display");
    var contentVisible  = (contentState == 'block') ? true: false;
    var ads_found       = document.getElementsByClassName('adsbygoogle').length;
    var ads_initialized = 0;

    if (j1.getState() === 'finished' && contentVisible && ads_found) {

    {% if advertising %}

        var logger                = log4javascript.getLogger('j1.core.advertising');
        var cookie_names          = j1.getCookieNames();
        var user_consent          = j1.readCookie(cookie_names.user_consent);
        var providerID            = '{{advertising_options.google.publisherID}}';
        var validProviderID       = (providerID.includes('pub-')) ? true : false;
        var advertisingProvider   = 'Google Adsense';
        var advertisingDefaults   = $.extend({},   {{advertising_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
        var aadvertisingSettings  = $.extend({},   {{advertising_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
        var advertisingOptions    = $.extend(true, {}, advertisingDefaults, aadvertisingSettings);
        var ad_containers;

        if (!validProviderID) {
          // skip setup processes
          clearInterval(dependencies_met_page_visible);
          return false;
        }

        // START create|loading adverting for containers enabled
        ad_containers = advertisingOptions.google.ads;
        ad_containers.forEach(function (ad) {
          if (user_consent.personalization) {
            var currentDiv = document.getElementById(ad.id);

            if (ad.enabled) {
              var ins = document.createElement('ins');

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

              ads_initialized ++
            } else {
              logger.warn('\n' + 'ad disabled on id ' + ad.id + ' for slot: ' + ad.slot);
            }
          } else {
            logger.warn('\n' + 'skipped add settings on all ad containers');
          };

        });
        // END loading adverting containers

        if (ads_initialized > 0) {
          logger.info('\n' + 'ads enabled found in page (total): ' + ads_found);
//        var google_ads = document.querySelectorAll('.adsbygoogle');
          var google_ads = document.getElementsByClassName('adsbygoogle');
          var counter    = document.getElementsByClassName('adsbygoogle').length -1;

          [].forEach.call(google_ads, function() {
            if (counter > 0) {
              (adsbygoogle = window.adsbygoogle || []).push({});
            }
            counter --;
          });
        } else {
          logger.warn('\n' + 'no ads found in page');
        }

      {% else %}
      // [WARN   ] [j1.core.advertising                     ] [ no init code placed ]
      {% endif %}

      clearInterval(dependencies_met_page_visible);
    }
  }, 10);

});

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
