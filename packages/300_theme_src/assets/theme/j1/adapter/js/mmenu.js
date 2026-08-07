---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/mmenu.js (4)
 # Liquid template to adapt Mmenu-Light Core functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
 # NOTE:
 #
 # JSON pretty print
 # Example: var str = JSON.stringify(obj, null, 2); // spacing level = 2
 # See: https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}
{% capture select_color %}themes/{{site.template.name}}/procedures/global/select_color.proc{% endcapture %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment                   = site.environment %}
{% assign brand_image_height            = site.brand.image_height %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
{% assign auth_manager_config           = site.j1_auth %}
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config               = site.data.template_settings %}
{% assign blocks                        = site.data.blocks %}
{% assign modules                       = site.data.modules %}

{% assign template_config               = site.data.template_settings %}
{% assign navigator_defaults            = modules.defaults.navigator.defaults %}
{% assign navigator_settings            = modules.navigator.settings %}
{% assign themes_defaults               = modules.defaults.themes.defaults %}
{% assign themes_settings               = modules.themes.settings %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign nav_mmenu_defaults            = navigator_defaults.nav_mmenu %}
{% assign nav_mmenu_settings            = navigator_settings.nav_mmenu %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign navigator_options             = navigator_defaults | merge: navigator_settings %}
{% assign themes_options                = themes_defaults | merge: themes_settings %}
{% assign nav_mmenu_options             = nav_mmenu_defaults | merge: nav_mmenu_settings %}
{% assign nav_mmenu_id                  = navigator_defaults.nav_mmenu.xhr_container_id %}
{% assign nav_navbar_media_breakpoint   = navigator_defaults.nav_bar.media_breakpoint %}
{% assign nav_mmenu_id                  = navigator_options.nav_mmenu.id %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/mmenu.js (4)
 # JS Adapter for J1 MobileMenu (MMenu Light)
 #
 # Product/Info:
 # {{site.data.template_settings.theme_author_url}}
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see {{site.data.template_settings.theme_author_url}}
 # -----------------------------------------------------------------------------
 # NOTE: For AJAX (XHR) loads see
 #  https://stackoverflow.com/questions/3709597/wait-until-all-jquery-ajax-requests-are-done
 # -----------------------------------------------------------------------------
 # NOTE: For getStyleValue helper see
 #  https://stackoverflow.com/questions/16965515/how-to-get-a-style-attribute-from-a-css-class-by-javascript-jquery
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.mmenu = ((j1, window) => {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment     = '{{environment}}';
  var dclFinished     = false;
  var moduleOptions   = {};
  var navMenuOptions  = {};
  var themesOptions   = {};
  var cookie_names    = j1.getCookieNames();
  var themesEnabled   = {{themes_options.enabled}};
  var state           = 'not_started';

  var user_state;
  var user_session;
  var user_data;

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
  // Fix MMenu #1
  // Private state for the "active" menu item management (Mobile Menu)
  //
  // Background:
  // The Mobile Menu renders its items as LI elements carrying the class
  // 'mm-item'. Clicking an item did NOT mark that item as being active and,
  // because EVERY item navigates to a NEW page, a class set on click would be
  // lost on page load anyway. Two problems had to be solved:
  //
  //   (1) The plugin's OWN click handler (see ~/modules/mmenu/js/modules/
  //       sliding-panels-navigation.js, method _initAnchors) calls
  //       evnt.stopImmediatePropagation() on the menu UL for all clicks it
  //       handles (an A element ALWAYS counts as handled). A delegated
  //       handler bound to the DOCUMENT in the bubble phase is therefore
  //       never reached. The handler below is registered for the CAPTURE
  //       phase, which runs BEFORE the target|bubble phase and can NOT be
  //       suppressed by stopImmediatePropagation().
  //
  //   (2) The active state has to SURVIVE navigation. It is re-derived on
  //       every page load from window.location.pathname, matched against the
  //       href of all menu items found (see restoreActiveMenuItem). The path
  //       of the item clicked last is kept in the sessionStorage as a
  //       FALLBACK only, used if the current location matches NO menu item.
  //
  // NOTE: The menu HTML is loaded by AJAX (j1.loadHTML) and the menu node is
  // MOVED by the plugin between its original container and the off-canvas
  // drawer (div.mm-ocd__content, a direct child of BODY) whenever the media
  // query matches. The scope scanned is therefore the BODY, and a
  // MutationObserver re-runs the restore for menus that arrive|move later.
  //
  // NOTE: This management is DISJOINT from the one of the J1 Navigator core
  // (see ~/modules/navigator/navigator.js, "Fix J1 Navigator issue #3"). The
  // Navigator collects items by the class 'dropdown-item', this fix collects
  // items by the class 'mm-item'. No item is touched by both.
  // ---------------------------------------------------------------------------
  //
  var activeItemSelector        = '.mm-item';
  var activeItemScope           = 'body';
  var activeItemPrefixFallback  = true;
  var activeItemStorageKey      = 'j1.adapter.mmenu.activeItemPath';
  var activeItemUserSet         = false;
  var activeItemInitialized     = false;
  var activeItemObserver        = null;
  var activeItemRestoreTimer    = null;

  // ---------------------------------------------------------------------------
  // Fix MMenu #2
  // Private state for the "active parent" menu item management (Mobile Menu)
  //
  // Background:
  // The previous fix (series #1) marks the item of the CURRENT page with the
  // class 'active'.
  // An item placed in a SUBMENU is NOT visible while the parent panel is
  // displayed: the sliding panels of the plugin show ONE panel at a time.
  // Without a mark on the PARENT item, the panel showing the parent gives NO
  // hint WHERE the current page is located.
  //
  // All items being an ANCESTOR of an active item are therefore marked with
  // the class 'active-parent' (see mmenuApplyActiveParents). Only elements
  // carrying the class 'mm-item' are marked, so items of other menus (e.g.
  // the J1 Navigator using the class 'dropdown-item') are NOT touched.
  //
  // NOTE: The classes 'active' and 'active-parent' are DISJOINT. An item can
  // never carry both: an ancestor is, by definition, placed ABOVE the active
  // item.
  //
  // NOTE: The plugin has its OWN mechanism for a selected item, configured by
  // 'mmenu_navigator.selected' (see mmenuInitializer). That class is read
  // ONCE, at construction time of the navigator (see ~/modules/mmenu/js/
  // modules/sliding-panels-navigation.js, method _setSelectedl), to OPEN the
  // panel the selected item is placed in. The restore of this adapter runs
  // AFTER the navigator was constructed (the menu HTML is loaded by AJAX), so
  // setting that class later has NO effect on the panel opened. Marking the
  // active item with the plugin class as well is therefore OPT-IN and set to
  // 'false' by default.
  //
  // DESIGN DECISION (for review): Setting
  // 'activeItemUsePluginSelectedClass' to 'true' makes the plugin open the
  // panel holding the item of the CURRENT page instead of the MAIN panel
  // whenever the navigator is (re-)constructed. That is a change of the menu
  // BEHAVIOR, NOT of its styling, and is left switched off here.
  // ---------------------------------------------------------------------------
  //
  var activeParentClass                 = 'active-parent';
  var activeSelectedClass               = 'Selected';
  var activeItemUsePluginSelectedClass  = false;

  // ---------------------------------------------------------------------------
  // Claude - Fix MMenu #3
  // Private state for the SELECTED class handed over to the plugin
  //
  // Background:
  // The initializer passes the configured class as the option 'selected' (see
  // mmenuInitializer), the plugin reads it as 'selectedClass' (see ~/modules/
  // mmenu/js/mmenu-light.js, method navigation, which destructures
  // 'options.selectedClass'). The names do NOT match, so the configured value
  // never reaches the plugin and its OWN default 'Selected' is used for EVERY
  // menu, whatever the YAML configuration says.
  //
  // The option is passed under its CORRECT name below. The original line
  // holding the (wrong) name is kept unchanged: an option the plugin does not
  // know is ignored, and 'initActiveMenuItems' still reads the same key.
  //
  // DESIGN DECISION (for review): The class is read ONCE, at construction
  // time of the navigator, to detect the panel to OPEN (see ~/modules/mmenu/
  // js/modules/sliding-panels-navigation.js, method _setSelectedl). As long
  // as the option never arrived, NO item ever carried the class in use
  // ('Selected'), so the MAIN panel was opened, always. Handing the
  // configured class over makes the plugin open the panel holding the item
  // carrying THAT class, if the menu HTML delivers such an item. Should the
  // menu keep opening on the MAIN panel in ANY case, set
  // 'navigatorPassSelectedClass' to 'false': the plugin default is handed
  // over then and the behavior of before the fix is restored.
  //
  // NOTE: The fallback below is the default of the plugin, NOT a J1 value. It
  // is used whenever NO class is configured, so an empty|missing YAML value
  // can NOT produce the selector '.' (see _setSelectedl, which prefixes the
  // class with a dot).
  // ---------------------------------------------------------------------------
  //
  var navigatorSelectedClassFallback    = 'Selected';
  var navigatorPassSelectedClass        = true;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Claude - Fix MMenu #3
  // mmenuSelectedClass()
  // Detect the class for selected items to be handed over to the plugin
  //
  // The key 'selectedClass' is checked FIRST, so a configuration using the
  // name of the plugin works as expected. The key 'selected' in use so far is
  // checked afterwards and keeps ALL existing configurations working.
  //
  // A leading dot is dropped: the plugin builds its selector by prefixing the
  // class with a dot, a value given as '.active' would end up as '..active'
  // and match NO item at all.
  //
  // Returns the class name to be used, NEVER an empty string.
  // ---------------------------------------------------------------------------
  function mmenuSelectedClass (mmOptions) {
    var configured = '';

    if (!navigatorPassSelectedClass) {
      return navigatorSelectedClassFallback;
    }

    if (mmOptions && mmOptions.mmenu_navigator) {
      configured = mmOptions.mmenu_navigator.selectedClass
                || mmOptions.mmenu_navigator.selected
                || '';
    }

    if (typeof configured !== 'string') {
      return navigatorSelectedClassFallback;
    }

    configured = configured.replace(/^\s+|\s+$/g, '');
    configured = configured.replace(/^\./, '');

    if (configured === '') {
      return navigatorSelectedClassFallback;
    }

    return configured;
  } // END mmenuSelectedClass

  // ---------------------------------------------------------------------------
  // Fix MMenu #1
  // mmenuNormalizePath()
  // Normalize a URL path for comparison
  //
  // Removes the query string and the fragment, collapses duplicate slashes,
  // drops a trailing 'index.html|index.htm' and drops a trailing slash. The
  // root path '/' is kept as is.
  // ---------------------------------------------------------------------------
  function mmenuNormalizePath (path) {
    var normalized = path || '';

    try {
      normalized = decodeURI(normalized);
    } catch (e) {
      // keep the raw (NOT decodable) value
    }

    normalized = normalized.split('#')[0];
    normalized = normalized.split('?')[0];
    normalized = normalized.replace(/\/{2,}/g, '/');
    normalized = normalized.replace(/\/index\.html?$/i, '/');

    if (normalized.length > 1) {
      normalized = normalized.replace(/\/+$/, '');
    }
    if (normalized === '') {
      normalized = '/';
    }

    return normalized;
  } // END mmenuNormalizePath

  // ---------------------------------------------------------------------------
  // Fix MMenu #1
  // mmenuAnchorPath()
  // Resolve the normalized path of an anchor element
  //
  // Returns 'null' for all links that do NOT navigate to a page of this site:
  // empty links, in-page links ('#', '#anchor'), pseudo protocols
  // (javascript:, mailto:, tel:, data:) and cross-origin links. The DOM
  // property 'pathname' is used, so RELATIVE links and a Jekyll 'baseurl' are
  // resolved by the browser against the document base.
  // ---------------------------------------------------------------------------
  function mmenuAnchorPath (anchorElement) {
    var href;

    if (!anchorElement || !anchorElement.getAttribute) {
      return null;
    }

    href = anchorElement.getAttribute('href');
    if (!href) {
      return null;
    }

    href = href.replace(/^\s+|\s+$/g, '');
    if (href === '' || href.charAt(0) === '#') {
      return null;
    }
    if (/^(javascript|mailto|tel|data|blob):/i.test(href)) {
      return null;
    }
    if (anchorElement.protocol && !/^https?:$/i.test(anchorElement.protocol)) {
      return null;
    }
    if (anchorElement.host && anchorElement.host !== window.location.host) {
      return null;
    }

    return mmenuNormalizePath(anchorElement.pathname || '');
  } // END mmenuAnchorPath

  // ---------------------------------------------------------------------------
  // Fix MMenu #1
  // mmenuItemAnchor()
  // Find the anchor that BELONGS to the given menu item
  //
  // The class 'mm-item' is carried by the LI element (the variant having the
  // class on the A element is supported as well). A PARENT item opening a
  // submenu contains a nested UL with the anchors of its CHILD items. Those
  // anchors do NOT belong to the parent item: without this filter, a parent
  // item would inherit the link of its first child and both items would be
  // marked active for the same page.
  // ---------------------------------------------------------------------------
  function mmenuItemAnchor (element) {
    var $item = $(element);
    var $anchor;

    if ($item.is('a[href]')) {
      return $item.get(0);
    }

    // anchors placed DIRECTLY in the item
    $anchor = $item.children('a[href]').first();

    // fallback: anchors nested in the item, but NOT in a submenu of the item
    if (!$anchor.length) {
      $anchor = $item
        .find('a[href]')
        .not($item.find('ul a[href], ol a[href]'))
        .first();
    }

    return $anchor.length ? $anchor.get(0) : null;
  } // END mmenuItemAnchor

  // ---------------------------------------------------------------------------
  // Fix MMenu #1
  // mmenuCollectItems()
  // Collect all Mobile Menu items of the given scope that link to a page
  //
  // The class 'mm-item' is carried by the LI element. For robustness, the
  // variant having the class on the A element is supported as well: the
  // element CARRYING the class is the element the class 'active' is set on,
  // the (first) contained A element supplies the link.
  //
  // Items WITHOUT a navigable link (e.g. parent items opening a submenu, or
  // the theme switcher items using href="#") are skipped entirely, so they
  // are neither marked nor cleared.
  // ---------------------------------------------------------------------------
  function mmenuCollectItems (scopeSelector) {
    var $scope  = $(scopeSelector || activeItemScope);
    var items   = [];

    $scope.find(activeItemSelector).each(function () {
      var anchor = mmenuItemAnchor(this);
      var path;

      if (!anchor) {
        return;
      }

      path = mmenuAnchorPath(anchor);
      if (!path) {
        return;
      }

      items.push({ element: this, path: path });
    });

    return items;
  } // END mmenuCollectItems

  // ---------------------------------------------------------------------------
  // Fix MMenu #1
  // mmenuBestMatch()
  // Find the menu path that matches the given page path best
  //
  // An EXACT match always wins. If no item matches exactly and the prefix
  // fallback is enabled, the LONGEST item path the current page lies below is
  // used, so that e.g. a post '/pages/public/blog/articles/my-post' still
  // highlights the menu item '/pages/public/blog'. The match is taken on a
  // path SEGMENT boundary only, so '/blog' never matches '/blogroll'.
  // ---------------------------------------------------------------------------
  function mmenuBestMatch (items, currentPath, prefixFallback) {
    var bestPath   = null;
    var bestLength = -1;
    var index;
    var path;

    for (index = 0; index < items.length; index++) {
      if (items[index].path === currentPath) {
        return items[index].path;
      }
    }

    if (!prefixFallback) {
      return null;
    }

    for (index = 0; index < items.length; index++) {
      path = items[index].path;
      if (path.length > 1
        && currentPath.indexOf(path + '/') === 0
        && path.length > bestLength) {
        bestPath   = path;
        bestLength = path.length;
      }
    }

    return bestPath;
  } // END mmenuBestMatch

  // ---------------------------------------------------------------------------
  // Fix MMenu #1
  // mmenuApplyActive()
  // Set the class 'active' on ALL items of the given path, remove it from all
  // other collected items. Only items collected by mmenuCollectItems() are
  // touched. Returns the number of items marked.
  //
  // NOTE: If the SAME menu is rendered more than once (e.g. the menu node and
  // a copy moved into the off-canvas drawer), all copies of the item are
  // marked. This is intentional: whichever copy is displayed shows the
  // correct state.
  // ---------------------------------------------------------------------------
  function mmenuApplyActive (items, path) {
    var index;
    var count = 0;

    // Fix MMenu #2: items marked, used to mark their ancestors
    var activeElements = [];

    for (index = 0; index < items.length; index++) {
      if (items[index].path === path) {
        $(items[index].element).addClass('active');
        count = count + 1;
        activeElements.push(items[index].element);
      } else {
        $(items[index].element).removeClass('active');
      }
    }

    // Fix MMenu #2
    // mark the PARENTS of the items marked. Placed here (NOT at the call
    // sites) to keep the state of 'active' and 'active-parent' in sync for
    // ALL callers (click handler AND restore).
    mmenuApplyActiveParents(activeElements);

    return count;
  } // END mmenuApplyActive

  // ---------------------------------------------------------------------------
  // Fix MMenu #2
  // mmenuApplyActiveParents()
  // Mark all items being an ANCESTOR of an active item
  //
  // The class 'active-parent' is removed from ALL items of the scope first,
  // so a state set for a FORMER page can NOT survive. All items being an
  // ancestor of one of the given active items are marked afterwards.
  //
  // Items of a submenu are nested as: LI.mm-item > UL > LI.mm-item. Walking
  // up by 'closest' therefore collects the ancestor items of ALL levels, not
  // only the level directly above.
  //
  // NOTE: Parent items are usually NOT collected by mmenuCollectItems() (they
  // carry NO navigable link), so they are never cleared by mmenuApplyActive().
  // The scope is re-scanned here for that reason.
  //
  // NOTE: If enabled (activeItemUsePluginSelectedClass, 'false' by default),
  // the class configured for the plugin ('mmenu_navigator.selected') is set
  // on the ACTIVE items as well, NOT on their ancestors: the plugin picks the
  // LAST item found carrying that class to detect the panel to open.
  //
  // Returns the number of items marked as being a parent.
  // ---------------------------------------------------------------------------
  //
  function mmenuApplyActiveParents (activeElements) {
    var $items = $(activeItemScope).find(activeItemSelector);
    var count  = 0;
    var index;
    var parent;

    // drop the state of a FORMER page (ALL items of the scope)
    $items.removeClass(activeParentClass);
    if (activeItemUsePluginSelectedClass && activeSelectedClass) {
      $items.removeClass(activeSelectedClass);
    }

    if (!activeElements || !activeElements.length) {
      return count;
    }

    for (index = 0; index < activeElements.length; index++) {

      // plugin hook (opt-in), set on the ACTIVE item only
      if (activeItemUsePluginSelectedClass && activeSelectedClass) {
        $(activeElements[index]).addClass(activeSelectedClass);
      }

      // walk UP the item tree, starting ABOVE the active item
      parent = activeElements[index].parentElement;
      parent = (parent && typeof parent.closest === 'function')
        ? parent.closest(activeItemSelector)
        : null;

      while (parent) {
        // an ACTIVE item is never marked as being a parent as well
        if (!$(parent).hasClass('active')) {
          $(parent).addClass(activeParentClass);
          count = count + 1;
        }

        parent = parent.parentElement
          ? parent.parentElement.closest(activeItemSelector)
          : null;
      }
    }

    if (logger) {
      logger.debug('active mmenu parent item|s marked: ' + count);
    }

    return count;
  } // END mmenuApplyActiveParents

  // ---------------------------------------------------------------------------
  // Fix MMenu #1
  // mmenuReadStoredPath()|mmenuWriteStoredPath()
  // Fallback persistence of the path clicked last
  //
  // The sessionStorage is used (NOT the localStorage) so the state is bound
  // to the browser tab and does NOT leak into a later session. All access is
  // guarded: a storage being unavailable (private mode, quota, disabled) must
  // NOT break the menu.
  // ---------------------------------------------------------------------------
  function mmenuReadStoredPath () {
    var storedPath = null;

    try {
      storedPath = window.sessionStorage.getItem(activeItemStorageKey);
    } catch (e) {
      storedPath = null;
    }

    return storedPath;
  } // END mmenuReadStoredPath

  function mmenuWriteStoredPath (path) {
    try {
      window.sessionStorage.setItem(activeItemStorageKey, path);
    } catch (e) {
      // storage NOT available, fall back to the location based restore only
    }

    return true;
  } // END mmenuWriteStoredPath

  // ---------------------------------------------------------------------------
  // Fix MMenu #1
  // mmenuActiveClickHandler()
  // Mark the Mobile Menu item clicked as being active
  //
  // Registered for the CAPTURE phase on the DOCUMENT (see the background note
  // above). Clicks NOT originating from a Mobile Menu item, and items without
  // a navigable link, are ignored.
  // ---------------------------------------------------------------------------
  function mmenuActiveClickHandler (evnt) {
    var target = evnt.target;
    var item;
    var anchor;
    var path;

    if (!target || typeof target.closest !== 'function') {
      return;
    }

    item = target.closest(activeItemSelector);
    if (!item) {
      return;
    }

    anchor = mmenuItemAnchor(item);
    if (!anchor) {
      return;
    }

    // ignore items that do NOT navigate to a page of this site
    path = mmenuAnchorPath(anchor);
    if (!path) {
      return;
    }

    mmenuApplyActive(mmenuCollectItems(activeItemScope), path);
    mmenuWriteStoredPath(path);
    activeItemUserSet = true;

    if (logger) {
      logger.debug('active mmenu item set on click: ' + path);
    }
  } // END mmenuActiveClickHandler

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.mmenu',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this         = j1.adapter.mmenu;
      logger        = log4javascript.getLogger('j1.adapter.mmenu');

      // initialize state flag
      _this.setState('started');
      logger.debug('state: ' + _this.getState());
      logger.info('module is being initialized');

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      /* eslint-disable */
      navMenuOptions = $.extend({}, {{nav_mmenu_options | replace: '=>', ':' }});
      themesOptions  = $.extend({}, {{themes_options | replace: '=>', ':' | replace: 'nil', '""' }});
      /* eslint-enable */
      var xhr_data_path;
      var menu_id;

      // save config settings into the mmenu object for global access
      //
      _this['navMenuOptions'] = navMenuOptions;

      // Load (individual) frontmatter options (currently NOT used)
      //
      if (options != null) { var frontmatterOptions = $.extend({}, options); }

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependency_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('state: ' + _this.getState());
          logger.info('module is being initialized');

          _this.mmenuLoader(navMenuOptions);

          clearInterval(dependency_met_page_ready);
        } // END if pageVisible
      }, 10); // END dependency_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // MMenu Loader
    // -------------------------------------------------------------------------
    mmenuLoader: (mmOptions) => {
      var menu_id;
      var xhr_data_path;

      _this.setState('loading');
      logger.debug('status: ' + _this.getState());
      logger.debug('load HTML data for navs and drawers');

      {% assign id_list = "" %}

      // -----------------------------------------------------------------------
      // Load HTML data (AJAX)
      // -----------------------------------------------------------------------
      // jadams, 202-06-24: Promise (chain) if $.when seems NOT to work correctly.
      // It semms a chain using .then will be a better solution to make it sure
      // that the last Deferred set the state to 'data_loaded'.
      // Found the final state randomly set to 'null' what prevent the module
      // to run mmenuInitializer.
      // Workaround: Set 'data_loaded' to be returned by all Deferred in
      // the chain.
      // See: https://stackoverflow.com/questions/5436327/jquery-deferreds-and-promises-then-vs-done
      //
      {% comment %} Modify chain
      --------------------------------------------------------------------------
        {% if forloop.last %}'data_loaded'{% else %}'null'{% endif %}){% if forloop.last %}{% else %},{% endif %}
      to
        {% if forloop.last %}'data_loaded'{% else %}'data_loaded'{% endif %}){% if forloop.last %}{% else %},{% endif %}
      -------------------------------------------------------------------------- {% endcomment %}

      {% for item in nav_mmenu_options.menus %} {% if item.menu.enabled %}

      {% assign menu_id           = item.menu.xhr_container_id %}
      {% assign xhr_data_path     = item.menu.xhr_data_path %}
      {% assign xhr_data_element  = item.menu.xhr_data_element %}

      j1.loadHTML ({
        xhr_container_id:   '{{menu_id}}',
        xhr_data_path:      '{{xhr_data_path}}',
        xhr_data_element:   '{{xhr_data_element}}' },
        'j1.adapter.mmenu',
        {% if forloop.last %}'data_loaded'{% else %}'null'{% endif %}){% if forloop.last %};{% else %};{% endif %}

      {% endif %}
      {% capture id_list %}{{id_list}}{{menu_id}}{% if forloop.last %}{% else %},{% endif %} {% endcapture %}
      {% endfor %} // ENDFOR menus

      logger.info('initialize navs and drawers');
      _this.mmenuInitializer(mmOptions);

      logger.info('initialize active state management for menu items');
      _this.initActiveMenuItems();

      _this.setState('finished');
      logger.debug('state: ' + _this.getState());
      logger.info('initializing module: finished');

      endTimeModule = Date.now();
      logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

    }, // END dataLoader

    // -------------------------------------------------------------------------
    // MMenu Initializer
    // -------------------------------------------------------------------------
    mmenuInitializer: (mmOptions) => {
      var menu_id;
      var xhr_data_path;

      {% for item in nav_mmenu_options.menus %} {% if item.menu.enabled %}

      {% assign menu_id = item.menu.xhr_container_id %}
      menu_id           = '{{menu_id}}';
      xhr_data_path     = '{{item.menu.xhr_data_path}}';

      // Create an mmenu instance if id exists: {{menu_id}}
      if ($('#{{menu_id}}').length) {

        logger.info('mmenu is being initialized on id: {{menu_id}}');

        {% if item.menu.content.type == "navigation" %}
        // Create an mmenu instance of type NAVIGATION
        logger.info('found content type: NAVIGATION');
        // ---------------------------------------------------------------------
        // menu initializer (NAVIGATION)
        // ---------------------------------------------------------------------
        // NOTE: Run load check (j1.xhrDataState) before initialization
        //
        logger.debug('initialize mmenu on id: #{{menu_id}}');
        var dependencies_met_{{menu_id}}_loaded = setInterval (() => {
          if (j1.xhrDataState['#{{menu_id}}'] == 'success' ) {
            logger.debug('met dependencies for: {{menu_id}}');

            const menu_selector = document.querySelector('#{{menu_id}}');
            const mmenu_{{menu_id}} = new MmenuLight (
              menu_selector,
              '(max-width: ' + mmOptions.mmenu_plugin.max_width +'px)', {
              // plugin options
              node:             mmOptions.mmenu_plugin.node,
              mediaQuery:       mmOptions.mmenu_plugin.mediaQuery
            });

            const drawer_{{menu_id}} = mmenu_{{menu_id}}.offcanvas ({
              // drawer options
              position: mmOptions.mmenu_drawer.position,
              toggle_mode: false
            });

            const navigator_{{menu_id}} = mmenu_{{menu_id}}.navigation ({
              // navigator options
              selected:         mmOptions.mmenu_navigator.selected,
              selectedClass:    mmenuSelectedClass(mmOptions),
              slidingSubmenus:  mmOptions.mmenu_navigator.slidingSubmenus,
              title:            mmOptions.mmenu_navigator.title,
              theme:            mmOptions.mmenu_navigator.theme
            });

            // make sure the QL menu is shown, if mmenu is closed
            // by clicking the mmenu backdrop
            //
            $('.mm-ocd__backdrop').click(function (e) {
              // suppress default actions|bubble up
              e.preventDefault();
              e.stopPropagation();

              $('#quicklinks').show();
              return false
            });

            // Toggle Bars (Hamburger) for the NavBar to open|close
            // the mmenu drawer
            //
            $('{{item.menu.content.button}}').each(function (e) {
              var $this = $(this);
              var clicked;

              $this.on('click', function (e) {
                // suppress default actions|bubble up
                e.preventDefault();
                e.stopPropagation();

                const button_{{menu_id}} = this;
                // toggle mmenu open|clse
                clicked = $('body.mm-ocd-opened').length ? true : false;
                if (clicked) {
                  drawer_{{menu_id}}.close();
                  $('#quicklinks').show();
                  clicked = false;
                } else {
                  $('#quicklinks').hide();
                  drawer_{{menu_id}}.open();
                  clicked = true;
                }
              });
            });

            // jadams, 2020-09-30: loading the menues (themes) if enabled
            if (themesEnabled) {
              // load REMOTE themes from Bootswatch API (localFeed EMPTY!)
              $('#remote_themes_mmenu').ThemeSwitcher({
                localFeed: '',
                bootswatchApiVersion: themesOptions.bootswatchApiVersion
              });
              // load LOCAL themes from JSON data
              $('#local_themes_mmenu').ThemeSwitcher({
                localFeed: themesOptions.localThemes
              });
            }

            $('#{{item.menu.content.id}}').show();
            logger.debug('initializing mmenu finished on id: #{{menu_id}}');

            clearInterval(dependencies_met_{{menu_id}}_loaded);
          }; // END mmenu_loaded
        }, 10); // END dependencies_met_mmenu_loaded
        {% endif %} // ENDIF content_type: NAVIGATION

        {% if item.menu.content.type == "drawer" %}
          // Create an mmenu instance of type HTML
          logger.info('found content type: DRAWER');
          // -------------------------------------------------------------------
          // menu initializer (DRAWER)
          // -------------------------------------------------------------------
          // TODO: Check if Toggle button make sense/should be implemented
          // NOTE: Run load check (j1.xhrDataState) before initialization
          //
          logger.debug('initialize mmenu on id: #{{menu_id}}');

          var dependencies_met_{{menu_id}}_loaded = setInterval (() => {
            if (j1.xhrDataState['#{{menu_id}}'] == 'success' && $('{{item.menu.content.button}}').length) {
              logger.debug('met dependencies for: xhrData/{{menu_id}}');

              const menu_selector = document.querySelector('#{{menu_id}}');
              const mmenu_{{menu_id}} = new MmenuLight (
                menu_selector,
                '(max-width: ' + mmOptions.mmenu_plugin.max_width +'px)', {
                // plugin options
                node:             mmOptions.mmenu_plugin.node,
                mediaQuery:       mmOptions.mmenu_plugin.mediaQuery
              });

              const drawer_{{menu_id}} = mmenu_{{menu_id}}.offcanvas ({
                position: '{{item.menu.drawer.position}}'
              });

              // set an id on the drawer wrapper div for later use
              //
              drawer_{{menu_id}}.wrapper.id = 'drawer_{{menu_id}}';

              // monitor for state changes on the drawer
              //
              $('#drawer_{{menu_id}}').attrchange({
                trackValues:  true,
                callback:     (event)  => {
                  logger.debug('hide|show the nav menu');
                  // switch off|on the (main) nav menu
                  $('#' + 'navigator_nav_navbar').toggle();
                  // $('#' + 'navbar-brand').toggle();
                  // $('#' + navMenuOptions.nav_main_menu).toggle();
                  // $('#' + navMenuOptions.nav_quicklinks).toggle();
                }
              });

              // button for the MMenu tocbar to open|close the toc drawer
              $('{{item.menu.content.button}}').each(function (e) {
                var $this = $(this);
                $this.on('click', function (e) {
                  var button_{{menu_id}} = this;
                  var hasClass;

                  // suppress default actions|bubble up
                  e.preventDefault();
                  e.stopPropagation();

                  // check if the button should be activated
                  // e.g for TOC only if class js-toc-content is found
                  //
                  if ('{{item.menu.content.button_activated}}' !== 'always') {
                    hasClass = $('main').hasClass('{{item.menu.content.button_activated}}');
                  } else {
                    hasClass = true;
                  }
                  if (hasClass) {
                    e.preventDefault();
                    drawer_{{menu_id}}.open();
                  } // END if hasclass
                });
              });

              logger.debug('met dependencies for: {{menu_id}} loaded');
              $('#{{item.menu.content.id}}').show();

              clearInterval(dependencies_met_{{menu_id}}_loaded);
          }; // END if menu_loaded
        }, 10); // END dependencies_met_mmenu_loaded
        logger.debug('initializing mmenu finished on id: #{{menu_id}}');
        {% endif %} // ENDIF content_type: DRAWER
        } // END menus|drawers
      {% endif %} // ENDIF menu enabled
      {% endfor %} // ENDFOR menus
    }, // END mmenuInitializer

    // -------------------------------------------------------------------------
    // Fix MMenu #1
    // restoreActiveMenuItem()
    // Restore the "active" Mobile Menu item for the CURRENT page
    //
    // The class 'active' set on click does NOT survive the page load
    // triggered by that very click. This method re-derives the state from
    // window.location.pathname instead. If the current location matches NO
    // menu item at all, the path clicked last (sessionStorage) is used as a
    // fallback.
    //
    // Returns 'true' if a matching item was found and marked.
    // -------------------------------------------------------------------------
    restoreActiveMenuItem: (scopeSelector) => {
      var currentPath = mmenuNormalizePath(window.location.pathname);
      var scope       = scopeSelector || activeItemScope;
      var items       = mmenuCollectItems(scope);
      var matchedPath;
      var storedPath;
      var marked;

      // no menu (yet) loaded, nothing to do
      if (!items.length) {
        return false;
      }

      matchedPath = mmenuBestMatch(items, currentPath, activeItemPrefixFallback);

      // fallback: use the path clicked last (exact matches ONLY)
      if (!matchedPath) {
        storedPath = mmenuReadStoredPath();
        if (storedPath) {
          matchedPath = mmenuBestMatch(items, storedPath, false);
        }
      }

      if (!matchedPath) {
        return false;
      }

      marked = mmenuApplyActive(items, matchedPath);

      if (logger) {
        logger.debug('active mmenu item restored: ' + matchedPath
          + ' (' + marked + ' item|s marked)');
      }

      return true;
    }, // END restoreActiveMenuItem

    // -------------------------------------------------------------------------
    // Fix MMenu #1
    // initActiveMenuItems()
    // Initialize the "active" Mobile Menu item management
    //
    // Registers ONE click handler on the DOCUMENT for the CAPTURE phase (the
    // plugin stops the propagation of clicks inside the menu, see background
    // note above), runs an initial restore and watches the DOM for menus that
    // arrive later by AJAX (j1.loadHTML) or that are MOVED around by the
    // media query toggler of the plugin.
    //
    // The method is IDEMPOTENT: it can be called more than once.
    // -------------------------------------------------------------------------
    initActiveMenuItems: () => {
      var observeTime = 30000;

      if (activeItemInitialized) {
        return true;
      }
      activeItemInitialized = true;

      // -----------------------------------------------------------------------
      // Fix MMenu #2
      // Take over the class configured for the plugin (see mmenuInitializer,
      // option 'selected' of mmOptions.mmenu_navigator). The plugin default
      // 'Selected' is kept if NO value is configured.
      //
      // NOTE: The class is used ONLY if activeItemUsePluginSelectedClass is
      // enabled (see the note at the top of this module).
      // -----------------------------------------------------------------------
      if (navMenuOptions
        && navMenuOptions.mmenu_navigator
        && navMenuOptions.mmenu_navigator.selected) {
        activeSelectedClass = navMenuOptions.mmenu_navigator.selected;
      }

      // -----------------------------------------------------------------------
      // Claude - Fix MMenu #3
      // Take over the SAME class the plugin is given (see mmenuInitializer).
      // Placed AFTER the assignment above, so the value used by the adapter
      // and the value used by the plugin can NOT drift apart: the helper
      // prefers the key 'selectedClass', accepts the key 'selected' as a
      // fallback and returns the plugin default if NOTHING is configured.
      // -----------------------------------------------------------------------
      activeSelectedClass = mmenuSelectedClass(navMenuOptions);

      // delegated click handler, CAPTURE phase
      document.removeEventListener('click', mmenuActiveClickHandler, true);
      document.addEventListener('click', mmenuActiveClickHandler, true);

      // initial restore for the menus already present
      _this.restoreActiveMenuItem();

      // jadams, 2026-08-06: disabled
      // restoreActiveMenuItem called too frequently w/o clear reason.
      // Possibly aside-effekt of Fix MMenu #3
      // -----------------------------------------------------------------------
      // re-run the restore for menus loaded (AJAX) or moved (drawer) later
      // if (window.MutationObserver && document.body) {
      //   activeItemObserver = new MutationObserver(() => {
      //     // do NOT overrule a state set by the user
      //     if (activeItemUserSet) {
      //       return;
      //     }
      //     window.clearTimeout(activeItemRestoreTimer);
      //     activeItemRestoreTimer = window.setTimeout(() => {
      //       _this.restoreActiveMenuItem();
      //     }, 50);
      //   });

      //   // NOTE: only 'childList' is observed. Setting the class 'active' is
      //   // an ATTRIBUTE mutation and can NOT re-trigger the observer.
      //   activeItemObserver.observe(document.body, {
      //     childList: true,
      //     subtree:   true
      //   });

      //   // stop watching after all menus had a fair chance to load
      //   window.setTimeout(() => {
      //     if (activeItemObserver) {
      //       activeItemObserver.disconnect();
      //       activeItemObserver = null;
      //     }
      //   }, observeTime);
      // }
      // -----------------------------------------------------------------------

      if (logger) {
        logger.debug('active mmenu item management initialized');
      }

      return true;
    }, // END initActiveMenuItems

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info(message.text);
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