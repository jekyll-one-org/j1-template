---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/cookieConsent.js (2)
 # Liquid template to create the Template Adapter for J1 CookieConsent
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # cookie_options: {{ cookie_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}
{% assign template_config     = site.data.j1_config %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_defaults     = modules.defaults.cookies.defaults %}
{% assign cookie_settings     = modules.cookies.settings %}
{% assign consent_defaults    = modules.defaults.cookieconsent.defaults %}
{% assign consent_settings    = modules.cookieconsent.settings %}
{% assign analytics_defaults  = modules.defaults.analytics.defaults %}
{% assign analytics_settings  = modules.analytics.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign consent_options     = consent_defaults | merge: consent_settings %}
{% assign cookie_options      = cookie_defaults | merge: cookie_settings %}
{% assign analytics_options   = analytics_defaults | merge: analytics_settings %}

{% comment %} Set variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign tracking_enabled    = analytics_options.enabled %}
{% assign tracking_id         = analytics_options.google.trackingID %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/cookieConsent.js (2)
 # JS Adapter for J1 CookieConsent
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2023-2026 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";

j1.adapter.cookieConsent = ((j1, window) => {

  // J1 CookieConsent optimizations #1
  // Drop the redundant `? true : false` ternary - the comparison
  // already returns a boolean. Same simplification applied below.
  const isDev               = (j1.env === "development" || j1.env === "dev");

  // J1 CookieConsent optimizations #1
  // Liquid-injected literals are immutable for the lifetime of the page,
  // so they belong in `const`, not `var`.
  const environment         = '{{environment}}';
  const tracking_enabled    = ('{{tracking_enabled}}' === 'true');
  const tracking_id         = '{{tracking_id}}';
  // J1 CookieConsent optimizations #1
  // Rewritten as a direct negation. The original
  //   (tracking_id.includes('tracking-id')) ? false : true
  // is equivalent but obscures the intent ("the placeholder string
  // 'tracking-id' means the ID has not been configured").
  const tracking_id_valid   = !tracking_id.includes('tracking-id');

  // J1 CookieConsent optimizations #1
  // Module-scope mutable state shared between init() and cbCookie().
  // Variables that were only read inside one function (e.g. $modal,
  // user_cookie, url, baseUrl, hostname, auto_domain, startTime,
  // endTime, timeSeconds, domainAttribute, stringifiedAttributes,
  // cookie_written) have been moved into the function that uses them
  // and are no longer hoisted to module scope. The previous setup
  // declared a long block of unused names which made the surface
  // area of the module hard to reason about.
  let _this;
  let logger;
  let logText;
  let cookie_names;
  let secure;
  let expireCookiesOnRequiredOnly;
  let cookieOptions;
  let cookieConsentOptions;

  // J1 CookieConsent optimizations #1
  // The original code polled j1.getState() every 10ms with no upper
  // bound. That is needlessly aggressive and, more importantly, will
  // keep the interval running for the lifetime of the tab if the j1
  // core never reaches state 'finished'. Both numbers are now named
  // constants and the polling loop honours a hard timeout.
  const READY_POLL_INTERVAL_MS = 50;
  const READY_POLL_TIMEOUT_MS  = 30000;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------
  // NOTE: RegEx for tracking_id: ^(G|UA|YT|MO)-[a-zA-Z0-9-]+$
  // See: https://stackoverflow.com/questions/20411767/how-to-validate-google-analytics-tracking-id-using-a-javascript-function/20412153

  // J1 CookieConsent optimizations #1
  // Internal helper: expire all "persistent" J1 cookies down to session
  // cookies. Both branches of cbCookie() previously contained the same
  // three j1.expireCookie() calls inline; centralising them removes the
  // duplication and keeps the two branches in sync if more cookies need
  // to be added later.
  function expirePersistentJ1Cookies(names) {
    j1.expireCookie({ name: names.user_state });
    j1.expireCookie({ name: names.user_consent });
    j1.expireCookie({ name: names.user_translate });
  }

  // J1 CookieConsent optimizations #1
  // Internal helper: when the user has not granted analysis OR
  // personalization consent, propagate that decision to the translate
  // cookie and disable the translation service. Extracted because the
  // exact same six-line block existed in both branches of cbCookie().
  function syncTranslateCookieFromConsent(names, user_consent, user_translate, isSecure) {
    user_translate.analysis           = user_consent.analysis;
    user_translate.personalization    = user_consent.personalization;
    user_translate.translationEnabled = false;

    return j1.writeCookie({
      name:   names.user_translate,
      data:   user_translate,
      secure: isSecure
    });
  }

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      // J1 CookieConsent optimizations #1
      // `settings` is built but never read after this point; keeping the
      // object literal is harmless, but use `const` instead of `var`.
      //
      const settings = $.extend({
        module_name: 'j1.adapter.cookieConsent',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this             = j1.adapter.cookieConsent;
      logger            = log4javascript.getLogger('j1.adapter.cookieConsent');
      cookie_names      = j1.getCookieNames();

      // J1 CookieConsent optimizations #1
      // These were module-scope `var`s but are only consumed inside
      // init(). Moving them into the function shrinks the surface area
      // of the IIFE and avoids accidental reuse from cbCookie().
      //
      const url         = new liteURL(window.location.href);
      const baseUrl     = url.origin;
      const hostname    = url.hostname;
      const auto_domain = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);

      // J1 CookieConsent optimizations #1
      // url.protocol always includes the trailing ':' (e.g. 'https:').
      // The previous `protocol.includes('https')` check would also
      // accept exotic values like 'httpsdummy:'. Use an exact match
      // and drop the redundant `? true : false` ternary.
      //
      secure = (url.protocol === 'https:');

      // Load cookie DEFAULTS|CONFIG
      const cookieDefaults = $.extend({}, {{cookie_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      const cookieSettings = $.extend({}, {{cookie_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      cookieOptions        = $.extend(true, {}, cookieDefaults, cookieSettings);

      // Load module DEFAULTS|CONFIG
      const cookieConsentDefaults = $.extend({}, {{consent_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      const cookieConsentSettings = $.extend({}, {{consent_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      cookieConsentOptions        = $.extend(true, {}, cookieConsentDefaults, cookieConsentSettings);

      // J1 CookieConsent optimizations #1
      // `cookieOptions.domain` is a string ('auto', a literal hostname,
      // or 'false'). The original `=== 'false' ? false : true` is a
      // no-op ternary - replace with a direct comparison.
      //
      const check_cookie_option_domain = (cookieOptions.domain !== 'false');

      // J1 CookieConsent optimizations #1
      // BUG FIX. The original code was:
      //   expireCookiesOnRequiredOnly =
      //     (cookieOptions.expireCookiesOnRequiredOnly === 'true') ? true : false;
      // Two issues:
      //
      //   1. The flag is defined in the cookie-CONSENT options
      //      (_data/modules/cookieconsent.yml), not in the cookie
      //      options (cookies.yml), so it was being read from the
      //      wrong object and was always `undefined`.
      //   2. The YAML literal `true` is interpolated into the JS
      //      object literal as the boolean `true`, not the string
      //      'true'. Comparing it against the string 'true' therefore
      //      always evaluated to false and silently disabled the
      //      failsafe.
      //
      // The fix reads from the correct options object, accepts the
      // camelCase user-setting key as well as the snake_case defaults
      // key, and treats both real booleans and quoted strings as truthy.
      //
      const rawExpireFlag =
        (cookieConsentOptions.expireCookiesOnRequiredOnly !== undefined)
          ? cookieConsentOptions.expireCookiesOnRequiredOnly
          : cookieConsentOptions.expire_cookies_on_required_only;
      expireCookiesOnRequiredOnly = (rawExpireFlag === true || rawExpireFlag === 'true');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      // J1 CookieConsent optimizations #1
      // Locals previously stored at module scope. They are only read
      // inside this initializer.
      //
      const startTimeModule       = Date.now();
      let   stringifiedAttributes = '';
      let   domainAttribute;

      // J1 CookieConsent optimizations #1
      // Polling failsafe. We capture the start time and bail out of the
      // interval if j1 core does not reach state 'finished' within
      // READY_POLL_TIMEOUT_MS. Also: the previous callback declared an
      // `options` parameter, but `setInterval` does not pass any
      // arguments to its callback - the parameter was always undefined
      // and shadowed the outer `options`. Removed.
      //
      const pollStart = Date.now();
      const dependencies_met_page_ready = setInterval(() => {
        // J1 CookieConsent optimizations #1
        // The original code also computed `pageVisible` by inspecting
        // $('#content').css('display'), but never read the result.
        // Removed to save a jQuery query on every tick.
        //
        const j1CoreFinished = (j1.getState() === 'finished');

        if (!j1CoreFinished) {
          // J1 CookieConsent optimizations #1
          // Hard timeout so a stalled core can no longer keep this
          // interval running for the lifetime of the tab.
          //
          if ((Date.now() - pollStart) > READY_POLL_TIMEOUT_MS) {
            logger.error('\n' + 'j1 core did not reach state "finished" within '
              + READY_POLL_TIMEOUT_MS + 'ms; aborting CookieConsent init');
            clearInterval(dependencies_met_page_ready);
          }
          return;
        }

        // ---------------------------------------------------------------------
        // j1 core is ready - run the one-shot initialization
        // ---------------------------------------------------------------------
        let same_site = cookieOptions.same_site;
        let expires;

        _this.setState('started');
        logger.debug('\n' + 'set module state to: ' + _this.getState());
        logger.info('\n' + 'initializing module: started');

        if (cookieConsentOptions.enabled) {
          expires = cookieOptions.expires;
        } else {
          // J1 CookieConsent optimizations #1
          // Use the shared helper instead of inlining the same three
          // j1.expireCookie() calls.
          //
          expirePersistentJ1Cookies(cookie_names);

          // disable the themes menus
          $('#themes_menu').css('display', 'none');
          $('#themes_mmenu').css('display', 'none');
          logger.warn('\n' + 'disable module: Themes');

          // disable the quick link for (Google) Translation
          $('#quickLinksTranslateButton').css('display', 'none');
          logger.warn('\n' + 'disable module: Translator');
        }

        // J1 CookieConsent optimizations #1
        // Both branches of the original `if (cookieOptions.domain === 'auto')`
        // appended the same `; Domain=<x>` segment to stringifiedAttributes.
        // Hoist the append out so it happens once, and pick the
        // domain value with a single conditional expression.
        //
        if (check_cookie_option_domain) {
          domainAttribute        = (cookieOptions.domain === 'auto') ? auto_domain : cookieOptions.domain;
          stringifiedAttributes += '; Domain=' + domainAttribute;
        } else {
          domainAttribute = cookieOptions.domain;
        }

        // failsafe: if 'None' is given for samesite in non-secure
        // environments open access to cookies to subdomains
        // ---------------------------------------------------------------------
        if (same_site === 'None' && !secure) {
          same_site = 'Lax';
        }

        // -------------------------------------------------------------------
        // NOTE: Click events moved to Navigator (core)
        // -------------------------------------------------------------------

        if (cookieConsentOptions.enabled) {
          logger.info('\n' + 'initialize core module');

          j1.cookieConsent = new CookieConsent({
            contentURL:             cookieConsentOptions.contentURL,           // dialog content (modals) for all supported languages
            cookieName:             cookie_names.user_consent,                 // name of the consent cookie
            cookieStorageDays:      expires,                                   // lifetime of a cookie [0..365], 0: session cookie
            cookieSameSite:         same_site,                                 // restrict consent cookie
            cookieSecure:           secure,                                    // only sent to the server with an encrypted request over HTTPS
            cookieDomain:           domainAttribute,                           // set domain (hostname|domain)
            whitelisted:            cookieConsentOptions.whitelisted,          // pages NO cookie dialog is shown
            reloadPageOnChange:     cookieConsentOptions.reloadPageOnChange,   // reload if settings has changed
            dialogContainerID:      cookieConsentOptions.dialogContainerID,    // container, the dialog modal is (dynamically) loaded
            xhrDataElement:         cookieConsentOptions.xhrDataElement,       // container for all language-specific dialogs (modals)
            postSelectionCallback:  cookieConsentOptions.postSelectionCallback // callback function, called after the user has made his selection
          });
        } else {
          logger.warn('\n' + 'module is disabled');
        } // END if cookieConsentOptions enabled

        _this.setState('finished');
        logger.debug('\n' + 'state: ' + _this.getState());
        logger.info('\n' + 'module initialized successfully');

        const endTimeModule = Date.now();
        logger.info('\n' + 'module initializing time: ' + (endTimeModule - startTimeModule) + 'ms');

        clearInterval(dependencies_met_page_ready);
      }, READY_POLL_INTERVAL_MS); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // cbCookie()
    // callback for CookieConsent module after the user has
    // made his selection
    // -------------------------------------------------------------------------
    cbCookie: (options) => {

      // J1 CookieConsent optimizations #1
      // The original implementation re-derived `url`, `hostname` and
      // `cookie_names` here even though they are already available from
      // the module closure (set in init()). It also declared
      // `user_agent`, `j1Cookies` and `cookie_written` without ever
      // reading them. All of that has been removed.
      //
      const gaCookies      = j1.findCookie('_ga');
      const gasCookies     = j1.findCookie('__ga');
      const user_consent   = j1.readCookie(cookie_names.user_consent);
      const user_translate = j1.readCookie(cookie_names.user_translate);

      logger.info('\n' + 'entered post selection callback from CookieConsent');
      logger.info('\n' + 'current values from CookieConsent: ' + JSON.stringify(user_consent));

      // J1 CookieConsent optimizations #1
      // Cache the jQuery selector. The original code looked up
      // #quickLinksCookieButton twice in immediate succession.
      //
      const $quickLinksCookieButton = $('#quickLinksCookieButton');
      if ($quickLinksCookieButton.css('display') === 'none') {
        $quickLinksCookieButton.css('display', 'block');
      }

      // J1 CookieConsent optimizations #1
      // Whether the user denied at least one of analysis /
      // personalization. Computed once and reused.
      //
      const requiredOnly = (!user_consent.analysis || !user_consent.personalization);

      // manage Google Analytics OptIn/Out
      // See: https://github.com/luciomartinez/gtag-opt-in/wiki
      if (tracking_enabled && tracking_id_valid) {
        // Managing cookie life-time
        // ---------------------------------------------------------------------
        // If cookie settings allows only "required" cookies, all "persistent"
        // cookies (Comments|Ads|Translation) get expired to "session" for
        // better GDPR compliance. The GDPR regulations does NOT require
        // any consent on session-only cookies.
        //
        if (requiredOnly) {
          syncTranslateCookieFromConsent(cookie_names, user_consent, user_translate, secure);

          // J1 CookieConsent optimizations #1
          // BUG FIX. The original code expired the persistent cookies
          // unconditionally on this branch, but on the parallel branch
          // below it only expired them when expireCookiesOnRequiredOnly
          // was true. The two branches are now consistent: the failsafe
          // setting is honoured regardless of whether tracking is on.
          //
          if (expireCookiesOnRequiredOnly) {
            expirePersistentJ1Cookies(cookie_names);
          }
        }
      } else {
        // failsafe: Make (really) sure all GA|GAS cookies are removed
        // left from a previous session/page view for better privacy compliance
        // ---------------------------------------------------------------------

        // remove cookies on invalid GA config or left from a previous
        // session/page view if they exist
        // ---------------------------------------------------------------------
        gaCookies.forEach((item) => {
          logger.warn('\n' + 'delete GA cookie: ' + item);
          j1.removeCookie({ name: item });
        });

        // remove cookies on invalid GAS config or left from a previous
        // session/page view if they exist
        // ---------------------------------------------------------------------
        gasCookies.forEach((item) => {
          // Remove cookies from Google Ads
          logger.warn('\n' + 'delete GAS cookie: ' + item);
          j1.removeCookie({ name: item });
        });

        // managing cookie life-time. If cookie settings allows only
        // "required" cookies, all "persistent" cookies (Comments|Ads|Translation)
        // get expired to "session" for better GDPR compliance. The GDPR
        // regulations|privacy does NOT require any consent on using cookies
        // for session-only cookies.
        //
        // ---------------------------------------------------------------------
        if (requiredOnly) {
          syncTranslateCookieFromConsent(cookie_names, user_consent, user_translate, secure);

          if (expireCookiesOnRequiredOnly) {
            expirePersistentJ1Cookies(cookie_names);
          }
        }
      } // END if tracking_enabled

      // J1 CookieConsent optimizations #1
      // The reload logic was duplicated at the bottom of both branches;
      // hoist it out. Also: `location.reload(true)` - the
      // `forceReload` parameter is non-standard and ignored by every
      // modern browser (Firefox keeps it for legacy reasons; Chrome,
      // Safari and Edge silently drop it). Use the standard no-arg
      // form, which already bypasses the cache when triggered by a
      // user action.
      //
      if (options && options.dataChanged && cookieConsentOptions.reloadPageOnChange) {
        location.reload();
      }
    }, // END cbCookie

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      // J1 CookieConsent optimizations #1
      // Only build the JSON dump when debug logging is actually
      // enabled. JSON.stringify on every inbound message is wasted
      // work in production where debug is off.
      //
      if (logger.isDebugEnabled && logger.isDebugEnabled()) {
        const json_message = JSON.stringify(message, undefined, 2);
        logText = '\n' + 'received message from ' + sender + ': ' + json_message;
        logger.debug(logText);
      }

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

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}