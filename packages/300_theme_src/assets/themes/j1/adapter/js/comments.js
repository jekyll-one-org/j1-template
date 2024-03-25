---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/comments.js
 # Liquid template to adapt the Comments module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  comments_options:  {{ comments_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment        = site.environment %}
{% assign asset_path         = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config    = site.data.j1_config %}
{% assign blocks             = site.data.blocks %}
{% assign modules            = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments_defaults  = modules.defaults.comments.defaults %}
{% assign comments_settings  = modules.comments.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments_options   = comments_defaults | merge: comments_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments           = comments_options.enabled %}
{% assign comments_provider  = comments_options.provider %}

{% if comments_provider == 'disqus' %}
  {% assign site_id = comments_options.disqus.site_id %}
{% elsif comments_provider == 'hyvor' %}
  {% assign site_id = comments_options.hyvor.site_id %}
{% elsif comments_provider == 'commento' %}
  {% assign site_id = comments_options.commento.site_id %}
{% elsif comments_provider == 'just-comments' %}
  {% assign site_id = comments_options.just-comments.site_id %}
{% elsif comments_provider == 'facebook' %}
  {% assign site_id = comments_options.facebook.site_id %}
{% else %}
  {% assign site_id = false %}
{% endif %}

{% comment %} language detection
-------------------------------------------------------------------------------- {% endcomment %}
{% if site.language == "en" %}
  {% assign language = "en" %}
{% elsif site.language == "de"%}
  {% assign language = "de" %}
{% else %}
  {% assign language = "en" %}
{% endif %}

{% if language == "en" %}
  {% assign comments_headline = comments_options.comments_headline.en %}
{% endif %}

{% if language == "de" %}
  {% assign comments_headline = comments_options.comments_headline.de %}
{% endif %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/comments.js
 # J1 Adapter for the comments module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';
j1.adapter.comments = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment       = '{{environment}}';
  var date              = new Date();
  var timestamp_now     = date.toISOString();
  var cookie_names      = j1.getCookieNames();
  var comments_provider = '{{comments_provider}}';
  var dqApiScript       = document.createElement('script');
  var hvApiScript       = document.createElement('script');
  var hvCallbackScript  = document.createElement('script');
  var comments_headline = '{{comments_headline}}';
  var state             = 'not_started';
  var providerID;
  var validProviderID;
  var commentsDefaults;
  var commentsSettings;
  var commentsOptions;
  var frontmatterOptions;
  var user_consent;

  var _this;
  var logger;
  var logText;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {
      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------

      // create settings object from frontmatter (page settings)
      frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // Load  module DEFAULTS|CONFIG
      commentsDefaults          = $.extend({}, {{comments_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      commentsSettings          = $.extend({}, {{comments_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      commentsOptions           = $.extend(true, {}, commentsDefaults, commentsSettings, frontmatterOptions);

      // overload module config from page settings (frontmatter)
      if (typeof commentsOptions.comments !== 'undefined' ) {
        commentsOptions.enabled = (commentsOptions.comments) === 'true' ? true : false;
      }

      if (commentsOptions.enabled) {
        // [INFO   ] [j1.adapter.comments                    ] [ detected comments provider (j1_config): {{comments_provider}}} ]
        // [INFO   ] [j1.adapter.comments                    ] [ start processing load region head, layout: {{page.layout}} ]

        // ---------------------------------------------------------------------
        // default module settings
        // ---------------------------------------------------------------------
        var settings = $.extend({
          module_name: 'j1.adapter.comments',
          generated:   '{{site.time}}'
        }, options);

        _this = j1.adapter.comments;
        logger = log4javascript.getLogger('j1.adapter.comments');

        // check the site ID to be used for a provider
        providerID      = (typeof commentsOptions.site_id == "number") ? commentsOptions.site_id.toString() : commentsOptions.site_id;
        validProviderID = (providerID.includes('your')) ? false : true;

        // ---------------------------------------------------------------------
        // module initializer
        // ---------------------------------------------------------------------
        {% case comments_provider %}
        {% when "hyvor" %}
        // [INFO   ] [j1.adapter.comments                    ] [ place provider: Hyvor Talk ]

        var dependencies_met_page_ready = setInterval(() => {
          var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

          if (j1CoreFinished) {
            startTimeModule = Date.now();

            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module is being initialized');

            if (!validProviderID) {
              logger.debug('\n' + 'invalid site id detected for Hyvor Talk: ' + providerID);
              logger.info('\n' + 'skip initialization for provider: ' + comments_provider);

              clearInterval(dependencies_met_page_ready);
              return false;
            }

            // place|remove initialization code
            // -----------------------------------------------------------------
            user_consent = j1.readCookie(cookie_names.user_consent);
            if (user_consent.personalization) {
              // enable Hyvor Talk
              // ---------------------------------------------------------------
              $('#main-content').append('<h2 id="leave-a-comment" class="mt-4">{{comments_headline}}</h2>');
              logger.info('\n' + 'user consent on comments: ' + user_consent.personalization);
              logger.info('\n' + 'enable comments provider' + ' {{comments_provider}} on siteID: ' + providerID);

              // add Hyvor Talk Web API
              // NOTE: don't change the script id
              // ---------------------------------------------------------------
              hvApiScript.id    = 'hyvor-embed';
              hvApiScript.src   = '//talk.hyvor.com/web-api/embed.js';
              hvApiScript.async = true;
              document.head.appendChild(hvApiScript);

              // add Hyvor Talk callback script
              // ---------------------------------------------------------------
              hvCallbackScript.id   = 'hyvor-callback';
              hvCallbackScript.text  = '\n';
              hvCallbackScript.text += 'var HYVOR_TALK_WEBSITE = "' + providerID + '"\n';
              hvCallbackScript.text += 'var HYVOR_TALK_CONFIG = {' + '\n';
              hvCallbackScript.text += '		  url: false,' + '\n';
              hvCallbackScript.text += '      id: false' + '\n';
              hvCallbackScript.text += '	  };' + '\n';
              document.head.appendChild(hvCallbackScript);

              // add Hyvor Talk comment container
              // NOTE: don't change the div id
              // ---------------------------------------------------------------
              $('#main-content').append('<div id="hyvor-talk-view"></div>');

              // add recommended title to the comments iframe for SEO optimization
              // ---------------------------------------------------------------
              var dependencies_met_load_provider_finished = setInterval(() => {
                if ($('#hyvor-talk-view').children().length) {
                  $('#hyvor-talk-iframe').prop('title', 'Hyvor comments iframe');
                  clearInterval(dependencies_met_load_provider_finished);
                }
              }, 10);
            } else {
              // disable Hyvor Talk
              logger.info('\n' + 'user consent on comments: ' + user_consent.personalization);
              logger.debug('\n' + 'disable Hyvor Talk on site id: ' + providerID);

              // remove Hyvor Talk resources
              $('#leave-a-comment').remove();
              $('#hyvor-embed').remove();
              $('#hyvor-callback').remove();
              $('#hyvor-talk-view').remove();
            }

            clearInterval(dependencies_met_page_ready);
          } // END if getState 'finished'
        }, 10);

        {% when "disqus" %}
        // [INFO   ] [j1.adapter.comments                    ] [ place provider: Disqus ]
        var dependencies_met_page_ready = setInterval(() => {
          var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

          if (j1CoreFinished) {
            startTimeModule = Date.now();

            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module is being initialized');

            if (!validProviderID) {
              logger.debug('\n' + 'invalid short name detected for Disqus: ' + providerID);
              logger.info('\n' + 'skip initialization for provider: ' + comments_provider);
              clearInterval(dependencies_met_page_ready);
              return;
            }

            // initialize state flag, issue init message
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module is being initialized for provider: ' + comments_provider);

            // place|remove initialization code
            user_consent = j1.readCookie(cookie_names.user_consent);
            if (user_consent.personalization) {
              $('#main-content').append('<h2 id="leave-a-comment" class="mt-4">{{comments_headline}}</h2>');
              logger.info('\n' + 'user consent on comments: ' + user_consent.personalization);
              logger.info('\n' + 'enable comments provider' + ' {{comments_provider}} on short name: ' + providerID);

              // old Disqus Web API init
              // ---------------------------------------------------------------
              // var disqus_shortname = '{{site_id}}';
              // // ------------------------------------------------------------
              // // RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE
              // // SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
              // // LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT:
              // // https://disqus.com/admin/universalcode/#configuration-variables
              // // ------------------------------------------------------------
              // //
              // // var disqus_config = function () {
              // // this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
              // // Replace PAGE_IDENTIFIER with your page's unique
              // // identifier variable
              // // this.page.identifier = PAGE_IDENTIFIER;
              // // };
              // //
              // // DON'T EDIT BELOW THIS LINE
              // // ------------------------------------------------------------
              // (function() {
              //     var d = document,
              //         s = d.createElement('script');
              //     s.src = '//' + disqus_shortname + '.disqus.com/embed.js';
              //     s.setAttribute('data-timestamp', +new Date());
              //     (d.head || d.body).appendChild(s);
              // })();

              // add|initialize Disqus Web API
              // ---------------------------------------------------------------
              dqApiScript.id    = 'dq-web-api';
              dqApiScript.src   = '//' + providerID + '.disqus.com/embed.js";'
              dqApiScript.setAttribute("data-timestamp", '"' + timestamp_now + '"');
              document.head.appendChild(dqApiScript);

              // add Disqus comment container
              // ---------------------------------------------------------------
              $('#main-content').append('<div id="disqus_thread"></div>');
            } else {
              logger.info('\n' + 'user consent on comments: ' + user_consent.personalization);
              logger.debug('\n' + 'disable comments provider' + ' {{comments_provider}} on short name: ' + providerID);
              $('#leave-a-comment').remove();
              $('#dq-web-api').remove();
              $('#hdisqus_thread').remove();
            }

            // add recommended title to the comments iframe for SEO optimization
            // -----------------------------------------------------------------
            // var dependencies_met_load_provider_finished = setInterval (function () {
            //   if ($('#disqus_thread').children().length) {
            //     $('#hyvor-talk-iframe').prop('title', 'Disqus comments iframe');
            //     clearInterval(dependencies_met_load_provider_finished);
            //   }
            // }, 10);

            clearInterval(dependencies_met_page_ready);
          } // END if getState 'finished'
        }, 10);
        {% endcase %}
      } else {
        var dependencies_met_page_ready = setInterval(() => {
          var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

          if (j1CoreFinished) {
            startTimeModule = Date.now();

            logger = log4javascript.getLogger('j1.adapter.comments');
            logger.info('\n' + 'comment services: disabled');

            endTimeModule = Date.now();
            logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

            clearInterval(dependencies_met_page_ready);
          } // END j1CoreFinished
        }, 10); // END dependencies_met_page_ready

      } // END if  commentsOptions.comments
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info('\n' + message.text);
      }

      //
      // place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: (stat) => {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return _this.state;
    } // END getState

  }; // END main (return)
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
