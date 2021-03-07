---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/cookie_bar.js
 # Liquid template to create the Template Adapter for J1 Cookiebar
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% assign config = site.data.modules.j1_cookiebar %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/cookie_bar.js
 # JS Adapter for J1 Cookiebar
 #
 # Product/Info:
 # http://jekyll.one
 # http://www.primebox.co.uk/projects/jquery-cookiebar/
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2016 Ant Parsons (primebox.co.uk)
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # jQuery Cookibar is licensed under Creative Commons Attribution 3.0 Unported License.
 # For details, see http://www.primebox.co.uk/projects/jquery-cookiebar/
 #
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/
'use strict';

{% comment %} Main
--------------------------------------------------------------- {% endcomment %}
j1.adapter['cookie_bar'] = (function (j1, window) {

  var environment   = '{{environment}}';
  var moduleOptions = {};
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function () {
      // initialize state flag
      j1.adapter.cookie_bar.state = 'pending';

      {% comment %} Set global variables
      -------------------------------------------------------------------------- {% endcomment %}
      _this   = j1.adapter.cookie_bar;
      logger  = log4javascript.getLogger('j1.adapter.cookie_bar');

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      $.cookieBar ({
        stopScrolling:          {{ config.stopScrolling | json }},
        autoEnable:             {{ config.autoEnable | json }},
        message:                {{ config.message | json }},
        acceptButton:           {{ config.acceptButton | json }},
        acceptText:             {{ config.acceptText | json }},
        acceptFunction:         {{ config.acceptFunction | json }},
        declineButton:          {{ config.declineButton | json }},
        declineText:            {{ config.declineText | json }},
        declineFunction:        {{ config.declineFunction | json }},
        policyButton:           {{ config.policyButton | json }},
        policyText:             {{ config.policyText | json }},
        policyURL:              {{ config.policyURL | json }},
        acceptOnContinue:       {{ config.acceptOnContinue | json }},
        acceptOnScroll:         {{ config.acceptOnScroll | json }},
        acceptAnyClick:         {{ config.acceptAnyClick | json }},
        expireDays:             {{ config.expireDays | json }},
        renewOnVisit:           {{ config.renewOnVisit | json }},
        forceShow:              {{ config.forceShow | json }},
        effect:                 {{ config.effect | json }},
        element:                {{ config.element | json }},
        append:                 {{ config.append | json }},
        fixed:                  {{ config.fixed | json }},
        bottom:                 {{ config.bottom | json }},
        zindex:                 {{ config.zindex | json }},
        domain:                 {{ config.domain | json }},
        referrer:               {{ config.referrer | json }}
      });

      _this.setState('finished');
      logger.info('state: ' + _this.getState());
      logger.info('initializing module finished');

      return true;
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info(message.text);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState
    // Set the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      j1.adapter.cookie_bar.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.cookie_bar.state;
    } // END state

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}