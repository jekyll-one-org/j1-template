/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/navigator/navigator.js (4)
 # Provides all JavaScript core functions for J1 Navigator
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/adamnurdin01/bootsnav
 #
 # Copyright (C) 2023-2026 Juergen Adams
 # Copyright (C) 2016 adamnurdin01
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.txt
 # Bootsnav is licensed under MIT License.
 # See: https://github.com/adamnurdin01/bootsnav/blob/master/LICENSE.txt
 #
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------

'use strict';
// -----------------------------------------------------------------------------
// Fix J1 Navigator issue #1
// Navigator core registered as 'j1.api.navigator'
// -----------------------------------------------------------------------------
//
window.j1     = window.j1     || {};
window.j1.api = window.j1.api || {};

window.j1.api.navigator = (function navigator(options) {

  // ---------------------------------------------------------------------------
  // global vars
  // ---------------------------------------------------------------------------
  var cookie_names = j1.getCookieNames();
  var user_state   = j1.readCookie(cookie_names.user_state);
  var message      = {};

  var state;
  var logger;
  var logText;

  // -----------------------------------------------------------------------
  // default settings
  // -----------------------------------------------------------------------
  var settings = $.extend ({
    foo: 'bar',
    bar: 'foo',
  }, options );

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Private state and helpers for the "active" menu item management
  //
  // Background:
  // Fix #2 registered a DELEGATED click handler on 'nav.navbar.navigator' that
  // marks the clicked li.dropdown-item as "active". Two gaps were flagged for
  // review by that fix and are closed here:
  //
  //   (1) The "active" class did NOT survive navigation. Each dropdown item
  //       loads a new page, so the class set on click is gone on page load.
  //       Closed by restoreActiveMenuItem(), matching the href of all menu
  //       items against window.location.pathname on load.
  //
  //   (2) The MOBILE menu (mmenu-light) was NOT covered. Verified against
  //       ~/assets/theme/j1/modules/mmenu_light/js/mmenu.js: the plugin
  //       method offcanvas() MOVES the menu node out of its original
  //       container into the off-canvas drawer (div.mm-ocd__content, a direct
  //       child of <body>) whenever the media query matches, and moves it
  //       back when it does not. The mobile menu is therefore NEVER inside
  //       'nav.navbar.navigator', and a handler scoped to that element can
  //       not see it. Closed by scoping the handler to the DOCUMENT and
  //       filtering on the href of the clicked item instead of on a fixed
  //       container.
  //
  // NOTE: Items are matched by their normalized link path. Desktop and mobile
  // render the SAME menu, so BOTH copies of the current page's item are marked
  // active. This is intentional: whichever menu the user opens shows the
  // correct state.
  // ---------------------------------------------------------------------------
  //
  var activeItemUserSet       = false;
  var activeItemObserver      = null;
  var activeItemRestoreTimer  = null;
  var activeItemInitialized   = false;

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #4
  // Private defaults for the "active parent" (ancestor) menu item management
  //
  // Background:
  // Fix #3 marks the menu item of the CURRENT page with the class 'active'.
  // The PARENT items that contain this item (the dropdown openers of level 1,
  // level 2 and level 3) stayed unmarked, so a closed menu gave no hint where
  // the current page lives.
  //
  // Verified against ~/assets/data/menu.html (the Liquid template that
  // generates the menu markup loaded by XHR). The menu nests like this:
  //
  //   ul.nav.navbar-nav.navigator            <- menu root
  //     li.dropdown.nav-item                 <- PARENT, level 1 opener
  //       a.nav-link.dropdown-toggle[href=#]
  //       ul.dropdown-menu
  //         li.dropdown-item > a[href]       <- LEAF, marked by fix #3
  //         li.dropdown.nav-sub-item         <- PARENT, level 2 opener
  //           a.dropdown-toggle[href=#]
  //           ul.dropdown-menu
  //             li.dropdown-item > a[href]   <- LEAF, marked by fix #3
  //             li.dropdown.nav-sub-item     <- PARENT, level 3 opener
  //               ul.dropdown-menu
  //                 li.dropdown-item > a[href]
  //
  // Every parent is therefore a real DOM ANCESTOR of the active leaf and is
  // found by a plain walk-up. No path arithmetic is needed and no assumption
  // about the URL layout is made: the menu structure itself defines what a
  // parent is.
  //
  // activeParentSelector:
  //   The LI elements that qualify as a parent. 'li.dropdown' covers both
  //   'li.dropdown.nav-item' (level 1) and 'li.dropdown.nav-sub-item'
  //   (level 2|3). The other two selectors are defensive only.
  //
  // NOTE: Leaf items ('.dropdown-item') are excluded from the parent handling
  // in both directions (marking and clearing), so the state managed by fix #3
  // can NOT be damaged, not even if 'activeParentClassName' is set to
  // 'active'.
  // ---------------------------------------------------------------------------
  //
  var activeParentSelector      = 'li.dropdown, li.nav-sub-item, li.megamenu-fw';
  var activeParentHighlight     = true;
  var activeParentClassName     = 'active-parent';
  var activeParentScopeSelector = 'body';

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #5
  // Private defaults for the fixes of series #5
  //
  // Background:
  // Fix #4 added the parent (ancestor) highlighting, but the parents were
  // detected by the CLASS SELECTOR 'activeParentSelector' only and every
  // element carrying the class 'dropdown-item' was excluded from the parent
  // handling. Both rules are too narrow for the menu markup generated by
  // ~/assets/data/menu.html:
  //
  //   (a) A dropdown OPENER of level 2|3 may carry the class 'dropdown-item'
  //       ITSELF (it is an item of the dropdown menu one level above AND the
  //       opener of its own submenu). The rule '.not(.dropdown-item)' of
  //       fix #4 removed exactly these openers again, so nothing was marked.
  //
  //   (b) A level 1 opener that carries 'li.nav-item' only (the class
  //       'dropdown' is added by Bootstrap|J1 for SOME menu layouts only)
  //       is not matched by 'activeParentSelector' at all.
  //
  // Fix #5 therefore detects the parents STRUCTURALLY: starting at the
  // active item, the DOM is walked UP and EVERY container LI found on the
  // way to the menu root is a parent - regardless of the classes it carries.
  // The class based detection of fix #4 is kept and both results are merged,
  // so no parent found by fix #4 can get lost.
  //
  // Leaf items are no longer excluded by their CLASS but by their IDENTITY:
  // only the elements collected as menu items by j1NavCollectItems() are
  // protected. This keeps the promise of fix #4 (the state managed by fix #3
  // can not be damaged, not even if 'activeParentClassName' is set to
  // 'active') and closes gap (a) at the same time.
  //
  // activeItemPlainSelector:
  //   Closes candidate (1) reported for fix #4: PLAIN top-level items (a
  //   'li.nav-item' with a real href and NO dropdown attached) were never
  //   collected, because j1NavCollectItems() scanned for '.dropdown-item'
  //   only. Such items were therefore never marked active. Set to an empty
  //   string to get the behaviour of fix #4 back.
  //
  // activeItemClearOnNoMatch:
  //   Closes candidate (2) reported for fix #4: restoreActiveMenuItem()
  //   returned early when nothing matched the current page and left all
  //   existing marks in place. With 'true' (default) the marks are cleared
  //   instead, so the menu state is always derived from the CURRENT page.
  //
  // activeParentStructural:
  //   Kill switch for the structural (walk-up) parent detection described
  //   above. Set to 'false' to use the class based detection of fix #4 only.
  //
  // activeParentMarkerAttribute:
  //   Data attribute set on every element marked as a parent. Used to clear
  //   the marks reliably on the next run (independent of the class name in
  //   use) and to write CSS rules that can not collide with other 'active'
  //   states of the page.
  //
  // activeParentRootSelector:
  //   Elements that end the walk-up. The menu root, the NAV element, the
  //   off-canvas drawer of mmenu-light and BODY.
  //
  // activeParentMaxDepth:
  //   Hard limit for the walk-up (defensive, prevents endless loops on
  //   damaged|detached DOM fragments).
  // ---------------------------------------------------------------------------
  //
  var activeItemPlainSelector     = 'li.nav-item';                                // Claude - Fix J1 Navigator issue #5
  var activeItemClearOnNoMatch    = true;                                         // Claude - Fix J1 Navigator issue #5
  var activeParentStructural      = true;                                         // Claude - Fix J1 Navigator issue #5
  var activeParentMarkerAttribute = 'data-j1-active-parent';                       // Claude - Fix J1 Navigator issue #5
  var activeParentRootSelector    = 'body, nav, ul.navbar-nav, ul.nav.navigator, .mm-ocd, .mm-ocd__content, .mm-panels'; // Claude - Fix J1 Navigator issue #5
  var activeParentMaxDepth        = 25;                                           // Claude - Fix J1 Navigator issue #5
  var activeParentStyleId         = 'j1NavActiveParentStyle';                      // Claude - Fix J1 Navigator issue #5

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Normalize a URL path for comparison
  //
  // Removes the query string and the fragment, collapses duplicate slashes,
  // drops a trailing 'index.html|index.htm' and drops a trailing slash. The
  // root path '/' is kept as is.
  // ---------------------------------------------------------------------------
  function j1NavNormalizePath (path) {
    var normalized = path || '';

    try {
      normalized = decodeURI(normalized);
    } catch (e) {
      // keep the raw (not decodable) value
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
  }

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Resolve the normalized path of an anchor element
  //
  // Returns 'null' for all links that do NOT navigate to a page of this site:
  // empty links, in-page links ('#', '#anchor'), pseudo protocols
  // (javascript:, mailto:, tel:, data:) and cross-origin links. The DOM
  // property 'pathname' is used, so RELATIVE links and a Jekyll 'baseurl'
  // are resolved by the browser against the document base.
  // ---------------------------------------------------------------------------
  function j1NavAnchorPath (anchorElement) {
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

    return j1NavNormalizePath(anchorElement.pathname || '');
  }

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Collect all menu items of the given scope that link to a page
  //
  // The class 'dropdown-item' is carried by the LI element in J1 menus, but
  // Bootstrap places it on the A element. Both variants are supported: the
  // element carrying the class is the element the class 'active' is set on,
  // the (first) contained A element supplies the link.
  //
  // Items WITHOUT a navigable link (e.g. the theme switcher that uses
  // href="#") are skipped entirely, so they are neither marked nor cleared.
  // ---------------------------------------------------------------------------
  function j1NavCollectItems (scopeSelector) {
    var $scope  = $(scopeSelector || 'body');
    var items   = [];

    $scope.find('.dropdown-item').each(function () {
      var $item   = $(this);
      var $anchor = $item.is('a[href]') ? $item : $item.find('a[href]').first();
      var path;

      if (!$anchor.length) {
        return;
      }

      path = j1NavAnchorPath($anchor.get(0));
      if (!path) {
        return;
      }

      items.push({ element: this, path: path });
    });

    // Claude - Fix J1 Navigator issue #5
    // Second pass: collect the PLAIN top-level items as well (candidate (1)
    // reported for fix #4). Items already collected by the pass above are
    // skipped by identity, so no item can end up in the list twice.
    j1NavCollectPlainItems($scope, items);                                        // Claude - Fix J1 Navigator issue #5

    return items;
  }

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Find the menu path that matches the current page best
  //
  // An EXACT match always wins. If no item matches exactly and the prefix
  // fallback is enabled, the LONGEST item path the current page lies below is
  // used, so that e.g. a post '/pages/public/blog/articles/my-post' still
  // highlights the menu item '/pages/public/blog'. The match is taken on a
  // path SEGMENT boundary only, so '/blog' never matches '/blogroll'.
  // ---------------------------------------------------------------------------
  function j1NavBestMatch (items, currentPath, prefixFallback) {
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
  }

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Set the class 'active' on all items of the given path, remove it from all
  // other collected items. Only items collected by j1NavCollectItems() are
  // touched.
  // ---------------------------------------------------------------------------
  function j1NavApplyActive (items, path) {
    var index;
    var count = 0;

    for (index = 0; index < items.length; index++) {
      if (items[index].path === path) {
        $(items[index].element).addClass('active');
        count = count + 1;
      } else {
        $(items[index].element).removeClass('active');
      }
    }

    // Claude - Fix J1 Navigator issue #4
    // Keep the parent (ancestor) marks in sync with the leaf marks set above.
    // This is the ONLY hook needed: j1NavApplyActive() is the single place
    // that changes the "active" state and is used by BOTH the restore on page
    // load and the delegated click handler of fix #3.
    j1NavApplyActiveParents(items, path);

    return count;
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #4
  // Read the effective configuration for the parent highlighting
  //
  // The public properties of the module (see 'activeParentHighlight',
  // 'activeParentClassName' and 'activeParentScopeSelector' in the returned
  // object below) win over the private defaults. Reading them on EVERY call
  // means the settings can be changed at runtime, e.g. from the browser
  // console or from the Navigator adapter:
  //
  //    j1.api.navigator.activeParentHighlight = false;   // kill switch
  //    j1.api.navigator.activeParentClassName = 'active active-parent';
  //
  // ---------------------------------------------------------------------------
  function j1NavParentConfig () {
    var api = (window.j1 && window.j1.api) ? window.j1.api.navigator : null;

    return {
      enabled: (api && typeof api.activeParentHighlight === 'boolean')
                 ? api.activeParentHighlight
                 : activeParentHighlight,

      className: (api && typeof api.activeParentClassName === 'string'
                    && api.activeParentClassName !== '')
                 ? api.activeParentClassName
                 : activeParentClassName,

      scope: (api && typeof api.activeParentScopeSelector === 'string'
                    && api.activeParentScopeSelector !== '')
                 ? api.activeParentScopeSelector
      // Original (deprecated, preserved for reference):
      //           : activeParentScopeSelector
                 : activeParentScopeSelector,                                     // Claude - Fix J1 Navigator issue #5

      // Claude - Fix J1 Navigator issue #5
      // Structural (walk-up) parent detection. Kill switch, see the private
      // defaults above.
      structural: (api && typeof api.activeParentStructural === 'boolean')        // Claude - Fix J1 Navigator issue #5
                 ? api.activeParentStructural                                     // Claude - Fix J1 Navigator issue #5
                 : activeParentStructural,                                        // Claude - Fix J1 Navigator issue #5

      // Claude - Fix J1 Navigator issue #5
      // Data attribute used to find|clear the marks set by this module
      marker: activeParentMarkerAttribute                                         // Claude - Fix J1 Navigator issue #5
    };
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #5
  // Read the effective configuration for the "active" (leaf) item management
  //
  // Same pattern as j1NavParentConfig() of fix #4: the public properties of
  // the module win over the private defaults and are read on EVERY call, so
  // the settings can be changed at runtime:
  //
  //    j1.api.navigator.activeItemPlainSelector  = '';      // kill switch
  //    j1.api.navigator.activeItemClearOnNoMatch = false;   // kill switch
  //
  // NOTE: An EMPTY string is a valid value for 'activeItemPlainSelector' and
  // switches the collection of plain top-level items off. The check is on
  // the TYPE only, not on the content.
  // ---------------------------------------------------------------------------
  function j1NavItemConfig () {
    var api = (window.j1 && window.j1.api) ? window.j1.api.navigator : null;

    return {
      plainSelector: (api && typeof api.activeItemPlainSelector === 'string')
                 ? api.activeItemPlainSelector
                 : activeItemPlainSelector,

      clearOnNoMatch: (api && typeof api.activeItemClearOnNoMatch === 'boolean')
                 ? api.activeItemClearOnNoMatch
                 : activeItemClearOnNoMatch
    };
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #5
  // Check if a DOM element is already part of the collected menu items
  //
  // The check is made on the ELEMENT IDENTITY, NOT on classes, so an element
  // can never be collected twice and a leaf item can never be treated as a
  // parent item.
  // ---------------------------------------------------------------------------
  function j1NavItemCollected (items, element) {
    var index;

    for (index = 0; index < items.length; index++) {
      if (items[index].element === element) {
        return true;
      }
    }

    return false;
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #5
  // Return all collected menu items as a jQuery set
  //
  // Used to protect the LEAF items from the parent handling by IDENTITY
  // instead of by the class 'dropdown-item' (see the private defaults above).
  // ---------------------------------------------------------------------------
  function j1NavItemElements (items) {
    var elements = [];
    var index;

    for (index = 0; index < items.length; index++) {
      elements.push(items[index].element);
    }

    return $(elements);
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #5
  // Collect the PLAIN (top-level) menu items of the given scope
  //
  // Closes candidate (1) reported for fix #4: a top-level item WITHOUT a
  // dropdown attached (e.g. a direct link to the home page) carries the
  // class 'nav-item' only and was never collected, because
  // j1NavCollectItems() scanned for '.dropdown-item'.
  //
  // Dropdown OPENERS are skipped: an opener contains a submenu (an UL of
  // class 'dropdown-menu|megamenu-content') or collected leaf items, and its
  // anchor is a '.dropdown-toggle' (mostly with href="#"). Openers are
  // handled by the PARENT logic, not by the item logic.
  //
  // For every plain item BOTH the LI element and its anchor are collected.
  // J1 sets the state on the LI ('.dropdown-menu > .active > a'), Bootstrap
  // on the anchor ('.nav-link.active'). Marking both makes the highlight
  // work with either styling and can not create a wrong state: both elements
  // point to the same page.
  //
  // Returns the number of items added to 'items' (the list is modified in
  // place).
  // ---------------------------------------------------------------------------
  function j1NavCollectPlainItems ($scope, items) {
    var config = j1NavItemConfig();
    var added  = 0;

    if (!config.plainSelector) {
      return 0;
    }

    $scope.find(config.plainSelector).each(function () {
      var $item = $(this);
      var $anchor;
      var path;

      // skip items already collected (identity check)
      if (j1NavItemCollected(items, this)) {
        return;
      }

      // skip leaf items of a dropdown (collected by the first pass)
      if ($item.is('.dropdown-item')) {
        return;
      }

      // skip dropdown openers (they are PARENTS, not items)
      if ($item.find('ul.dropdown-menu, ul.megamenu-content, .dropdown-item').length) {
        return;
      }

      $anchor = $item.is('a[href]') ? $item : $item.find('a[href]').first();
      if (!$anchor.length) {
        return;
      }
      if ($anchor.is('.dropdown-toggle')) {
        return;
      }

      // ignore items that do NOT navigate to a page of this site
      path = j1NavAnchorPath($anchor.get(0));
      if (!path) {
        return;
      }

      items.push({ element: this, path: path });
      added = added + 1;

      // collect the anchor as well (see the note above)
      if ($anchor.get(0) !== this && !j1NavItemCollected(items, $anchor.get(0))) {
        items.push({ element: $anchor.get(0), path: path });
        added = added + 1;
      }
    });

    return added;
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #5
  // Build the delegated click selector for the "active" item management
  //
  // Extends the selector '.dropdown-item' used by fix #3 by the plain
  // top-level items, so a click on a plain item marks it active as well.
  // ---------------------------------------------------------------------------
  function j1NavItemClickSelector () {
    var config   = j1NavItemConfig();
    var selector = '.dropdown-item';

    if (config.plainSelector) {
      selector = selector + ', ' + config.plainSelector;
    }

    return selector;
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #4
  // Mark all PARENT items that contain an item of the given path
  //
  // Closes the gap reported for fix #3: only the leaf item was marked, the
  // dropdown openers above it were not. For every leaf item matching 'path'
  // the DOM is walked UP and each container LI (see 'activeParentSelector')
  // gets the class named by 'activeParentClassName' (default 'active-parent').
  //
  // All stale parent marks inside the scope are cleared FIRST, so switching
  // the page never leaves a highlighted branch behind.
  //
  // Leaf items ('.dropdown-item') are excluded explicitly. They are owned by
  // j1NavApplyActive() and must not be touched here.
  //
  // Both the desktop navbar and the mobile (mmenu-light) rendering are
  // covered: the default scope is 'body', and mmenu-light keeps the nested
  // UL structure of the menu intact, so the ancestor chain of a leaf item is
  // the same in both renderings.
  //
  // Returns the number of parent elements marked.
  // ---------------------------------------------------------------------------
  function j1NavApplyActiveParents (items, path) {
    var config = j1NavParentConfig();
    var count  = 0;
    var index;
    var $parents;
    var $leaves;                                                                  // Claude - Fix J1 Navigator issue #5

    if (!config.enabled) {
      return 0;
    }

    // Claude - Fix J1 Navigator issue #5
    // The LEAF items are protected by their IDENTITY from here on, NOT by
    // the class 'dropdown-item'. A dropdown opener of level 2|3 carries that
    // class ITSELF, so the rule of fix #4 excluded exactly the parents that
    // should be marked.
    $leaves = j1NavItemElements(items);                                           // Claude - Fix J1 Navigator issue #5

    // Original (deprecated, preserved for reference):
    // // clear ALL stale parent marks of the scope first
    // $(config.scope)
    //   .find(activeParentSelector)
    //   .not('.dropdown-item')
    //   .removeClass(config.className);
    //
    // clear ALL stale parent marks of the scope first
    j1NavClearActiveParents(config, $leaves);                                     // Claude - Fix J1 Navigator issue #5

    // mark the ancestors of every leaf item of the current page. Desktop and
    // mobile render the SAME menu, so more than one leaf can match.
    for (index = 0; index < items.length; index++) {
      if (items[index].path !== path) {
        continue;
      }

      // Original (deprecated, preserved for reference):
      // $parents = $(items[index].element)
      //              .parents(activeParentSelector)
      //              .not('.dropdown-item');
      //
      // $parents.addClass(config.className);
      // count = count + $parents.length;
      $parents = j1NavCollectItemParents(                                         // Claude - Fix J1 Navigator issue #5
        items[index].element, config, $leaves                                     // Claude - Fix J1 Navigator issue #5
      );                                                                          // Claude - Fix J1 Navigator issue #5

      // Claude - Fix J1 Navigator issue #5
      // The marker attribute is set in ADDITION to the class. It makes the
      // marks of THIS module findable for the next run, no matter which
      // class name is configured, and can be used for CSS rules that can not
      // collide with other 'active' states of the page:
      //
      //   nav.navbar.navigator li[data-j1-active-parent] > a { ... }
      $parents                                                                    // Claude - Fix J1 Navigator issue #5
        .addClass(config.className)                                               // Claude - Fix J1 Navigator issue #5
        .attr(config.marker, 'true');                                             // Claude - Fix J1 Navigator issue #5

      count = count + $parents.length;                                            // Claude - Fix J1 Navigator issue #5
    }

    if (logger) {
      logger.debug('\n' + 'active parent items marked: ' + count
        + ' (class: ' + config.className + ')');
    }

    return count;
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #5
  // Collect ALL parent (ancestor) elements of one menu item
  //
  // This is the fix for the main issue reported for fix #4: no parent item
  // was marked when a descendant became active.
  //
  // Two detections are merged:
  //
  //   (1) CLASS based (the detection of fix #4)
  //       All ancestors matching 'activeParentSelector'
  //       ('li.dropdown, li.nav-sub-item, li.megamenu-fw').
  //
  //   (2) STRUCTURAL (new)
  //       Starting at the item, the DOM is walked UP. EVERY container LI
  //       found on the way to the menu root is a parent - whatever classes
  //       it carries. This is exact by construction: inside a menu, an LI
  //       can only be an ancestor of another item if it OPENS the submenu
  //       that item lives in.
  //
  // Detection (2) closes both gaps of fix #4:
  //   - a level 1 opener carrying 'li.nav-item' only (no class 'dropdown')
  //   - a level 2|3 opener carrying the class 'dropdown-item' itself
  //
  // The walk stops at the menu root, the NAV element, the off-canvas drawer
  // of mmenu-light or BODY (see 'activeParentRootSelector') and is limited
  // to 'activeParentMaxDepth' steps.
  //
  // LEAF items are removed from the result by IDENTITY ('$leaves'), so the
  // state managed by fix #3 stays untouched even if 'activeParentClassName'
  // is set to 'active'.
  //
  // Returns a jQuery set of the parent elements (may be empty).
  // ---------------------------------------------------------------------------
  function j1NavCollectItemParents (element, config, $leaves) {
    var $item       = $(element);
    var $parents    = $item.parents(activeParentSelector);
    var structural  = [];
    var depth       = 0;
    var $current;

    if (config && config.structural) {
      $current = $item.parent();

      while ($current.length && depth < activeParentMaxDepth) {
        if ($current.is(activeParentRootSelector)) {
          break;
        }
        if ($current.is('li')) {
          structural.push($current.get(0));
        }
        $current = $current.parent();
        depth    = depth + 1;
      }

      if (structural.length) {
        $parents = $parents.add(structural);
      }
    }

    // protect the item itself and ALL collected leaf items
    $parents = $parents.not($item);
    if ($leaves && $leaves.length) {
      $parents = $parents.not($leaves);
    }

    return $parents;
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #5
  // Clear all parent marks of the configured scope
  //
  // Two sources are cleared:
  //
  //   (1) All elements carrying the marker attribute (marks set by this
  //       module, independent of the class name currently configured).
  //   (2) All elements matching 'activeParentSelector' (marks set by
  //       fix #4 before this fix was applied, or by a class name that was
  //       changed at runtime).
  //
  // LEAF items are excluded by IDENTITY, so the class 'active' of the
  // current item can NOT be removed here - not even if
  // 'activeParentClassName' is set to 'active'.
  //
  // Returns the number of elements cleared.
  // ---------------------------------------------------------------------------
  function j1NavClearActiveParents (config, $leaves) {
    var $scope  = $((config && config.scope) ? config.scope : activeParentScopeSelector);
    var marker  = (config && config.marker) ? config.marker : activeParentMarkerAttribute;
    var name    = (config && config.className) ? config.className : activeParentClassName;
    var $marked = $scope.find('[' + marker + ']').add($scope.find(activeParentSelector));

    if ($leaves && $leaves.length) {
      $marked = $marked.not($leaves);
    }

    $marked.removeClass(name).removeAttr(marker);

    return $marked.length;
  }

  // ---------------------------------------------------------------------------
  // Claude - Fix J1 Navigator issue #5
  // Inject a MINIMAL default style for the marked parent items
  //
  // The default class 'active-parent' of fix #4 is a NEW class: setting it
  // is correct, but WITHOUT a matching CSS rule nothing becomes visible. The
  // rule below uses the marker ATTRIBUTE, so it works for every configured
  // class name and can not collide with other 'active' states of the page.
  //
  // Switched OFF by default (see 'activeParentInjectStyle' in the returned
  // object) to keep the look of an existing site unchanged. Enable it with:
  //
  //    j1.api.navigator.activeParentInjectStyle = true;
  //
  // or call 'j1.api.navigator.injectActiveParentStyle()' directly, optionally
  // with own CSS rules as the (single) argument.
  // ---------------------------------------------------------------------------
  function j1NavInjectActiveParentStyle (cssRules) {
    var marker = activeParentMarkerAttribute;
    var css    = cssRules;
    var style;

    if (document.getElementById(activeParentStyleId)) {
      return false;
    }

    if (!css) {
      css = 'nav.navbar.navigator li[' + marker + '] > a,'
          + ' .mm-ocd li[' + marker + '] > a {'
          + ' font-weight: 600 !important;'
          + ' }';
    }

    style = '<style id="' + activeParentStyleId + '">' + css + '</style>';
    $('head').append(style);

    return true;
  }

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function( defaultOptions, menuOptions ) {
      logger = log4javascript.getLogger('j1.navigator.core');

      logger.debug('\n' + 'initializing module: started');

      // -----------------------------------------------------------------------
      // Create a Wrapper for the nav system
      // -----------------------------------------------------------------------
      $('body').wrapInner('<div id="wrapper-inner" class="wrapper"></div>');

      this.manageDropdownMenu(defaultOptions, menuOptions);
      this.navbarSticky();
      this.eventHandler(defaultOptions);
      this.initActiveMenuItems();

      logger.debug('\n' + 'initializing module: finished');

      message.type    = 'state';
      message.action  = 'core_initialized';
      message.text    = 'navigator core initialized';
      j1.sendMessage('j1.navigator.core', 'j1.adapter.navigator', message);

      return true;
    },

    // -------------------------------------------------------------------------
    // event handler
    // -------------------------------------------------------------------------
    eventHandler: function(options) {
      var defaultOptions    = options;
      var $getNav           = $('nav.navbar.navigator');
      var scrollDuration    = 300;
      var page_link;
      var img_link;
      var classname;
      var nav_link;
      var anchor_id;
      var scrollOffset;
      var json_data;

      logger.debug('\n' + 'initializing eventHandler: started');

      // bind click event to all plain '#' links to prevent default action
      // 'scroll-to-top'
      // See:
      //  https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
      //  https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
      //  https://stackoverflow.com/questions/134845/which-href-value-should-i-use-for-javascript-links-or-javascriptvoid0
      //
      $('a[href="#"]').click(function(e) {
        page_link    = document.querySelector('[id="' + decodeURI(anchor_id).split('#').join('') + '"]') ? true : false;
        anchor_id    = e.target.hash ? e.target.hash : false;
        classname    = e.target.className ? e.target.className : '';
        nav_link     = classname.includes('nav-');

        if (nav_link || !page_link) {
          logger.debug('\n' + 'click event on href "#" detected: prevent default action');
          e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
      });

      // bind click event to all HTML elements of class '.badge' (Bootstrap)
      // for smooth-scroll (in-page) to a '<div>' element
      // -----------------------------------------------------------------------
      $('.badge').on('click', function (e) {
        anchor_id    = e.target.hash ? e.target.hash : false;
        scrollOffset = 100;

        if (anchor_id) {
          logger.debug('\n' + 'click event on badge detected: ' + anchor_id);
          $('html, body').animate({
            scrollTop: $(anchor_id).offset().top - scrollOffset
          }, scrollDuration);
          event.stopPropagation();
        }
      });

      // bind click event to all HTML elements of class '.badge-tag' (j1)
      // for smooth-scroll (in-page)
      $('.badge-tag').on('click', function (e) {
        anchor_id    = e.target.hash ? e.target.hash : false;
        scrollOffset = j1.getScrollOffset();

        if (anchor_id) {
          logger.debug('\n' + 'click event on badge-tag detected: ' + anchor_id);
          $('html, body').animate({
            scrollTop: $(anchor_id).offset().top + scrollOffset
          }, scrollDuration);
          event.stopPropagation();
        }
      });

      // -----------------------------------------------------------------------
      // Navbar Sticky
      // -----------------------------------------------------------------------
      var navSticky = $getNav.hasClass('navbar-sticky');
      if( navSticky ){
        // Wraped navigation
        $getNav.wrap('<div class=\'wrap-sticky\'></div>');
      }

      // -----------------------------------------------------------------------
      // Navbar Center
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('brand-center') ){
        var postsArr    = new Array();
        var index       = $('nav.brand-center');
        var $postsList  = index.find('ul.navbar-nav');

        // create array of all posts in lists
        index.find('ul.navbar-nav > li').each(function(){
          postsArr.push($(this).html());
        });

        // split the array at this point. The original array is altered.
        var firstList   = postsArr.splice(0, Math.round(postsArr.length / 2));
        var secondList  = postsArr;
        var ListHTML    = '';

        var createHTML = function(list) {
          ListHTML = '';
          for (var i = 0; i < list.length; i++) {
            ListHTML += '<li>' + list[i] + '</li>';
          }
        };

        // generate HTML for first list
        createHTML(firstList);
        $postsList.html(ListHTML);
        index.find('ul.nav').first().addClass('navbar-left');

        // generate HTML for second list
        createHTML(secondList);
        // create new list after original one
        $postsList.after('<ul class="nav navbar-nav"></ul>').next().html(ListHTML);
        index.find('ul.nav').last().addClass('navbar-right');

        // wrap navigation menu
        index.find('ul.nav.navbar-left').wrap('<div class=\'col_half left\'></div>');
        index.find('ul.nav.navbar-right').wrap('<div class=\'col_half right\'></div>');

        // selection Class
        index.find('ul.navbar-nav > li').each(function() {
          var dropDown = $('ul.dropdown-menu', this),
            megaMenu = $('ul.megamenu-content', this);
          dropDown.closest('li').addClass('dropdown');
          megaMenu.closest('li').addClass('megamenu-fw');
        });
      }

      // -----------------------------------------------------------------------
      // Menu Center
      // -----------------------------------------------------------------------
      if( $getNav.find('ul.nav').hasClass('navbar-center')) {
        $getNav.addClass('menu-center');
      }

      // -----------------------------------------------------------------------
      // Navbar Full
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('navbar-full')) {
        // add Class to body
        $('nav.navbar.navigator').find('ul.nav').wrap('<div class=\'wrap-full-menu\'></div>');
        $('.wrap-full-menu').wrap('<div class=\'nav-full\'></div>');
        $('ul.nav.navbar-nav').prepend('<li class=\'close-full-menu\'><a href=\'#\'><i class=\'mdi mdi-close\'></i></a></li>');
      } else if( $getNav.hasClass('navbar-mobile') ) {
        $getNav.removeClass('no-full');
      } else {
        $getNav.addClass('no-full');
      }

      // -----------------------------------------------------------------------
      // Navbar Fixed
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('no-background') ) {
        $(window).on('scroll', function() {
          var navbarHeighth = $('nav.navbar').outerHeight();
          var scrollPos     = $(window).scrollTop();

          if (scrollPos > navbarHeighth) {
            $('.navbar-fixed').removeClass('no-background');
          } else {
            $('.navbar-fixed').addClass('no-background');
          }
        });
      }

      if( $getNav.hasClass('navbar-transparent') ) {
        $(window).on('scroll', function() {
          var navbarHeighth = $('nav.navbar').outerHeight();
          var scrollPos     = $(window).scrollTop();

          if (scrollPos > navbarHeighth) {
            $('.navbar-fixed').removeClass('navbar-transparent');
            $('.navbar-fixed').addClass('navbar-scrolled');
          } else {
            $('.navbar-fixed').removeClass('navbar-scrolled');
            $('.navbar-fixed').addClass('navbar-transparent');
          }
        });
      }

      // -----------------------------------------------------------------------
      // Manage events for all quicklinks
      // https://stackoverflow.com/questions/178325/how-do-i-check-if-an-element-is-hidden-in-jquery
      // https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
      // https://stackoverflow.com/questions/5963669/whats-the-difference-between-event-stoppropagation-and-event-preventdefault
      // -----------------------------------------------------------------------
      $('.quicklink-nav').each(function() {

        // ---------------------------------------------------------------------
        // ThemeToggler
        //

        // -------------------------------------------------------------------
        // Event Mgmt from themeToggler SHOULD placed here
        // -------------------------------------------------------------------

        // ---------------------------------------------------------------------
        // site_search
        //
        if ($('li.site_search')) {

          logger.debug('register OPEN event for site_search');

          $('li.site_search > a', this).on('click', function(e) {
            logger.debug('manage search action OPEN');
            $('#searchModal').modal('show');
          });

        } // END site_search

        // ---------------------------------------------------------------------
        // DocSearch dialog
        //
        if ($('li.documind')) {
          logger.debug('register SHOW event for J1 DocSearch');
          $('li.documind > a', this).on('click', function(e) {
            j1.adapter.docsearch.showDialog();
          });
        } // END DocSearch

        // ---------------------------------------------------------------------
        // Translator dialog
        //
        if ($('li.translate')) {
          logger.debug('register SHOW event for J1 Translator');
          $('li.translate > a', this).on('click', function(e) {
            j1.translator.showDialog();
          });
        } // END Translator

        // ---------------------------------------------------------------------
        // Speak2Me dialog
        //
        if ($('li.speak')) {
          logger.debug('register SHOW event for J1 Speak2Me');
          $('li.speak > a', this).on('click', function(e) {
            j1.adapter.speak2me.showDialog();
          });
        } // END Speak2Me

        // ---------------------------------------------------------------------
        // CookieConsent dialog
        //
        if ($('li.cookie-consent')) {
          logger.debug('register SHOW event for J1 CookieConsent');
          $('li.cookie-consent > a', this).on('click', function(e) {
            j1.cookieConsent.showDialog();
          });
        } // END CookieConsent

      }); // End manage events for all quicklinks

      logger.debug('\n' + 'initializing eventHandler: finished');

    }, // END eventHandler

    // -------------------------------------------------------------------------
    // Manage the Menu Dropdowns for Desktop|Mobile
    // -------------------------------------------------------------------------
    manageDropdownMenu : function( defaultOptions, menuOptions ) {

      var navDefaultOptions   = defaultOptions;
      var navMenuOptions      = menuOptions;

      var $getNav             = $('nav.navbar.navigator');
      var $windowOrientation  = window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
      var $getWindow          = $(window).width();
      var $getNavWidth        = $('nav').width();
      var $getIn              = $getNav.find('ul.nav').data('in');
      var $getOut             = $getNav.find('ul.nav').data('out');

      var menuSelector        = '#' +navMenuOptions.xhr_container_id+ '.collapse';
      var quicklinksSelector  = '#navigator_nav_quicklinks';
      var delayMenuOpen       = navMenuOptions.delay_menu_open;

      var breakPoint;

      var $menu;
      var $dropDown;
      var timeoutHandle;

      // BS4 @media MAX breakpoints
      // NOTE: a media query is always a range
      // -----------------------------------------------------------------------
      var gridBreakpoint_lg = 992;                                              // bs-breakpoint-lg
      var gridBreakpoint_md = 768;                                              // bs-breakpoint-md
      var gridBreakpoint_sm = 576;                                              // bs-breakpoint-sm

      // @media ranges
      // -----------------------------------------------------------------------
      var small_range         = {min: '0em',      max: '40em'};                 /* 0, 640px */
      var medium_range        = {min: '40.063em', max: '64em'};                 /* 641px, 1024px */
      var large_range         = {min: '64.063em', max: '90em'};                 /* 1025px, 1440px */
      var xlarge_range        = {min: '90.063em', max: '120em'};                /* 1441px, 1920px */
      var xxlarge_range       = {min: '120.063em'};                             /* 1921px */

      // jadams, 2019-05-01: Set Media Breakpoint for Desktop|Mobile Navigation
      if ( navDefaultOptions.nav_bar.media_breakpoint === 'lg' ) {
        breakPoint = gridBreakpoint_lg;
      } else if ( navDefaultOptions.nav_bar.media_breakpoint === 'md' ) {
        breakPoint = gridBreakpoint_md;
      } else if ( navDefaultOptions.nav_bar.media_breakpoint === 'sm' ) {
        breakPoint = gridBreakpoint_sm;
      } else{
        breakPoint = gridBreakpoint_lg;
      }

      // -----------------------------------------------------------------------
      // Tablet or Mobile
      // NOTE:
      //    Managing the mobile menu is moved to MMenu Plugin
      //    Only base functions like QuickLinks are managed by
      //    J1 Navigator
      // -----------------------------------------------------------------------
      // MIN media breakpoint
      if ( $getWindow <= breakPoint ) {

        // collapse Navbar (Desktop Navigation)
        $(menuSelector).addClass('navbar-collapse');
        $(menuSelector).removeClass('show');

        // show QuicklinksBar
        $(quicklinksSelector).addClass('show');

      // -----------------------------------------------------------------------
      // Desktop Navigation does NOT work on physical devices like iPad|Pro
      // Config DISABLED
      //
      } else if ( $getWindow > breakPoint ) {
      // -----------------------------------------------------------------------
      // Desktop
      // -----------------------------------------------------------------------
        $('#navigator_nav_quicklinks').removeClass('show');
        $('#desktop_menu').show();

        // jadams, 2021-03-05: manage dropdown menus
        // ---------------------------------------------------------------------

        $('.dropdown-menu > li').on('mouseenter', function(){
          if ($('body').hasClass('stop-scrolling')){
            return false;
          } else {
            $('body').addClass('stop-scrolling');
          }
        });

        $('.dropdown-menu > li').on('mouseleave', function(){
          // stop scrolling if top search or any (mmenu) drawer is opened
          if ($('body').hasClass('stop-scrolling')){
            $('body').removeClass('stop-scrolling');
          }
        });

        // limit the dropdown menu lenght if needed
        $('.dropdown-menu > li').hover(function() {
          var $container  = $(this);
          var $list       = $container.find('ul');

          // limit LAST menu ONLY
          if ( $list.length == 1 ) {
            $list.addClass('scrollable-menu');
          }
        });

        // jadams, 2021-03-06: Enable|Show Desktop Menu|s
        //
        $(menuSelector).removeClass('navbar-collapse');
        $(menuSelector).addClass('show');

        // open Desktop Menu|s on hover
        $('nav.navbar.navigator ul.nav').each(function() {

          $('a.dropdown-toggle', this).off('click');

          $('.megamenu-fw', this).each(function() {
            $('.title', this).off('click');
            $('a.dropdown-toggle', this).off('click');
            $('.content').removeClass('animate__animated ');
          });

          $('.dropdown-menu', this).addClass('animate__animated ');

          $('li.dropdown', this).on('mouseenter', function(e) {
            $menu     = $('.dropdown-menu', this).eq(0);
            $dropDown = $(this);

            $menu.removeClass($getOut);
            $menu.removeClass('open');
            $dropDown.addClass('open');

            // create a timeout object to delay the dropdown menus to open
            timeoutHandle = window.setTimeout(function () {
              if ($dropDown.hasClass('open')) {
                $menu.stop().fadeIn().addClass($getIn);
                $menu.addClass('open');
                $dropDown.addClass('open');
              }
            }, delayMenuOpen);
            return true;
          });

          $('li.dropdown', this).on('mouseleave', function(e) {
            $menu     = $('.dropdown-menu', this).eq(0);
            $dropDown = $(this);

            // clear the timeout object for dropdown menus 'open'
            window.clearTimeout(timeoutHandle);

            $menu.removeClass($getIn);
            $menu.addClass($getOut);
            $menu.fadeOut('slow');
            $dropDown.removeClass('open');

           return true;
          });
        }); // END Desktop Menu

      } // end Desktop

      // -----------------------------------------------------------------------
      //  Fullscreen Menu
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('navbar-full')){
        var windowHeight = $(window).height(),
          windowWidth =  $(window).width();

        $('.nav-full').css('height', windowHeight + 'px');
        $('.wrap-full-menu').css('height', windowHeight + 'px');
        $('.wrap-full-menu').css('width', windowWidth + 'px');

        $('.navbar-collapse').addClass('animate__animated ');
        $('.navbar-toggle').each(function(){
          var getId = $(this).data('target');
          $(this).off('click');
          $(this).on('click', function(e) {
            e.preventDefault();
            $(getId).removeClass($getOut);
            $(getId).addClass('in');
            $(getId).addClass($getIn);
          });

          $('li.close-full-menu').on('click', function(e) {
            e.preventDefault();
            $(getId).addClass($getOut);
            setTimeout(function(){
              $(getId).removeClass('in');
              $(getId).removeClass($getIn);
            }, 500);
          });
        });
      }
    },  // end manageDropdownMenu

    // -------------------------------------------------------------------------
    // Sticky Navbar
    // -------------------------------------------------------------------------
    navbarSticky : function() {
      var $getNav = $('nav.navbar.navigator'),
        navSticky = $getNav.hasClass('navbar-sticky');

      if (navSticky) {
        // set height navigation
        var $getHeight = $getNav.height();
        $('.wrap-sticky').height($getHeight);

        // Windown on scroll
        var getOffset = $('.wrap-sticky').offset().top;
        $(window).on('scroll', function(){
          var scrollTop = $(window).scrollTop();
          if(scrollTop > getOffset){
            $getNav.addClass('sticked');
          }else {
            $getNav.removeClass('sticked');
          }
        });
      }
    }, // end navbarSticky

    // -------------------------------------------------------------------------
    // Fix J1 Navigator issue #3
    // Configuration for the "active" menu item management
    //
    // activeItemScopeSelector:
    //   The DOM scope scanned for menu items. The default 'body' covers the
    //   desktop navbar AND the mobile menu, INCLUDING the state where the
    //   mmenu-light plugin has moved the menu node into its off-canvas drawer
    //   (div.mm-ocd, a direct child of <body>). Narrow it down (e.g. to
    //   'nav.navbar.navigator, .mm-ocd') only if other Bootstrap dropdowns on
    //   the page must be excluded.
    //
    // activeItemPrefixFallback:
    //   If 'true' (default) and no menu item matches the current page
    //   exactly, the menu item of the closest PARENT path is marked active.
    //   Set to 'false' for exact matches only.
    // -------------------------------------------------------------------------
    activeItemScopeSelector:  'body',
    activeItemPrefixFallback: true,

    // -------------------------------------------------------------------------
    // Claude - Fix J1 Navigator issue #4
    // Configuration for the "active parent" menu item management
    //
    // activeParentHighlight:
    //   Kill switch. If 'true' (default), all PARENT items (the dropdown
    //   openers of level 1, 2 and 3) that contain the active item are marked.
    //   Set to 'false' to get exactly the behaviour of fix #3 back:
    //
    //     j1.api.navigator.activeParentHighlight = false;
    //
    // activeParentClassName:
    //   The class (or a space separated LIST of classes) set on the parent
    //   items. The default 'active-parent' is a NEW class and needs a CSS
    //   rule to become visible, e.g.:
    //
    //     nav.navbar.navigator li.dropdown.active-parent > a { font-weight: 600; }
    //
    //   Use 'active' instead to reuse the styling of the active leaf item,
    //   or 'active active-parent' to get both:
    //
    //     j1.api.navigator.activeParentClassName = 'active active-parent';
    //
    // activeParentScopeSelector:
    //   The DOM scope cleared from stale parent marks. Kept in sync with
    //   'activeItemScopeSelector' of fix #3; the default 'body' covers the
    //   desktop navbar AND the mobile menu, including the state where the
    //   mmenu-light plugin has moved the menu into its off-canvas drawer.
    // -------------------------------------------------------------------------
    activeParentHighlight:     true,
    activeParentClassName:     'active-parent',
    activeParentScopeSelector: 'body',

    // -------------------------------------------------------------------------
    // Claude - Fix J1 Navigator issue #5
    // Configuration for the fixes of series #5
    //
    // activeItemPlainSelector:
    //   The PLAIN top-level menu items (a real link, no dropdown attached)
    //   collected IN ADDITION to the '.dropdown-item' items of fix #3. Set
    //   to an EMPTY string to switch this off (kill switch):
    //
    //     j1.api.navigator.activeItemPlainSelector = '';
    //
    // activeItemClearOnNoMatch:
    //   If 'true' (default), all marks are CLEARED when no menu item matches
    //   the current page. Set to 'false' to keep the behaviour of fix #4
    //   (existing marks are left untouched):
    //
    //     j1.api.navigator.activeItemClearOnNoMatch = false;
    //
    // activeParentStructural:
    //   If 'true' (default), the parents are detected by walking the DOM UP
    //   from the active item (every container LI is a parent). Set to
    //   'false' to use the class based detection of fix #4 only:
    //
    //     j1.api.navigator.activeParentStructural = false;
    //
    // activeParentInjectStyle:
    //   If 'true', a minimal CSS rule is injected that makes the marked
    //   parent items visible (bold link text). Default 'false': the look of
    //   an existing site is NOT changed unless this is switched on.
    //
    //     j1.api.navigator.activeParentInjectStyle = true;
    // -------------------------------------------------------------------------
    activeItemPlainSelector:   'li.nav-item',
    activeItemClearOnNoMatch:  true,
    activeParentStructural:    true,
    activeParentInjectStyle:   false,

    // -------------------------------------------------------------------------
    // Fix J1 Navigator issue #3
    // Restore the "active" menu item for the CURRENT page
    //
    // Closes review item (1) of fix #2: the class 'active' set on click does
    // not survive the page load triggered by that very click. This method
    // re-derives the state from window.location.pathname instead.
    //
    // Returns 'true' if a matching item was found and marked.
    // -------------------------------------------------------------------------
    restoreActiveMenuItem: function (scopeSelector) {
      var currentPath = j1NavNormalizePath(window.location.pathname);
      var scope       = scopeSelector || this.activeItemScopeSelector;
      var items       = j1NavCollectItems(scope);
      var matchedPath;
      var marked;

      // Original (deprecated, preserved for reference):
      // if (!items.length) {
      //   return false;
      // }
      //
      // Claude - Fix J1 Navigator issue #5
      // Closes candidate (2) reported for fix #4: returning early left ALL
      // existing marks in place. Harmless on a full page load, but wrong if
      // the menu is re-rendered in place (AJAX). The marks are cleared now,
      // so the state always reflects the CURRENT page.
      if (!items.length) {
        if (j1NavItemConfig().clearOnNoMatch) {                                   // Claude - Fix J1 Navigator issue #5
          j1NavClearActiveParents(j1NavParentConfig(), null);                     // Claude - Fix J1 Navigator issue #5
        }                                                                         // Claude - Fix J1 Navigator issue #5
        return false;
      }

      matchedPath = j1NavBestMatch(
        items, currentPath, this.activeItemPrefixFallback
      );

      // Original (deprecated, preserved for reference):
      // if (!matchedPath) {
      //   return false;
      // }
      //
      // Claude - Fix J1 Navigator issue #5
      // Same as above: no match means NO item of this menu belongs to the
      // current page. Passing 'null' as the path clears the class 'active'
      // from all collected items AND all parent marks of the scope.
      if (!matchedPath) {
        if (j1NavItemConfig().clearOnNoMatch) {                                   // Claude - Fix J1 Navigator issue #5
          j1NavApplyActive(items, null);                                          // Claude - Fix J1 Navigator issue #5
        }                                                                         // Claude - Fix J1 Navigator issue #5
        return false;
      }

      marked = j1NavApplyActive(items, matchedPath);

      if (logger) {
        logger.debug('\n' + 'active menu item restored: ' + matchedPath
          + ' (' + marked + ' item|s marked)');
      }

      return true;
    }, // END restoreActiveMenuItem

    // -------------------------------------------------------------------------
    // Fix J1 Navigator issue #3
    // Initialize the "active" menu item management
    //
    // Registers ONE delegated click handler on the DOCUMENT (closing review
    // item (2) of fix #2: the mobile mmenu-light menu is moved OUT of
    // 'nav.navbar.navigator' into the off-canvas drawer, so a handler bound
    // to the NAV element can never see it), runs an initial restore and
    // watches the DOM for menus that arrive later by AJAX (j1.loadHTML) or
    // that are moved around by the mmenu-light media query toggler.
    //
    // NOTE: The handler is IDEMPOTENT with respect to the handler installed
    // by fix #2 on 'nav.navbar.navigator'. Both compute the same final state
    // for a desktop click, so fix #2 can stay in place unchanged.
    // -------------------------------------------------------------------------
    initActiveMenuItems: function () {
      var _self       = this;
      var observeTime = 30000;
      var clickSelector;                                                          // Claude - Fix J1 Navigator issue #5

      if (activeItemInitialized) {
        return true;
      }
      activeItemInitialized = true;

      // Claude - Fix J1 Navigator issue #5
      // Optional default styling for the marked parent items (switched off
      // by default, see 'activeParentInjectStyle' above).
      if (_self.activeParentInjectStyle) {                                        // Claude - Fix J1 Navigator issue #5
        j1NavInjectActiveParentStyle();                                           // Claude - Fix J1 Navigator issue #5
      }                                                                           // Claude - Fix J1 Navigator issue #5

      // Claude - Fix J1 Navigator issue #5
      // The click selector covers the plain top-level items now as well
      // (candidate (1) reported for fix #4).
      clickSelector = j1NavItemClickSelector();                                   // Claude - Fix J1 Navigator issue #5

      // delegated click handler, valid for desktop AND mobile menus
      $(document).off('click.j1navActiveItem');
      // Original (deprecated, preserved for reference):
      // $(document).on('click.j1navActiveItem', '.dropdown-item', function () {
      $(document).on('click.j1navActiveItem', clickSelector, function () {        // Claude - Fix J1 Navigator issue #5
        var $item   = $(this);
        var $anchor = $item.is('a[href]')
                        ? $item
                        : $item.find('a[href]').first();
        var path;

        // Claude - Fix J1 Navigator issue #5
        // Ignore dropdown OPENERS. A click on a leaf item BUBBLES up to the
        // top-level LI that contains it; without this guard the opener would
        // be treated as the clicked item.
        if (!$item.is('.dropdown-item')                                           // Claude - Fix J1 Navigator issue #5
          && $item.find('ul.dropdown-menu, ul.megamenu-content, .dropdown-item').length) { // Claude - Fix J1 Navigator issue #5
          return;                                                                 // Claude - Fix J1 Navigator issue #5
        }                                                                         // Claude - Fix J1 Navigator issue #5

        if (!$anchor.length) {
          return;
        }

        // ignore items that do NOT navigate to a page of this site
        // (e.g. the theme switcher items using href="#")
        path = j1NavAnchorPath($anchor.get(0));
        if (!path) {
          return;
        }

        // mark the clicked item AND its twin in the other (desktop|mobile)
        // rendering of the same menu, clear all other items
        j1NavApplyActive(
          j1NavCollectItems(_self.activeItemScopeSelector), path
        );

        activeItemUserSet = true;
      });

      // initial restore for the menus already present
      _self.restoreActiveMenuItem();

      // re-run the restore for menus loaded (AJAX) or moved (mmenu) later
      if (window.MutationObserver && document.body) {
        activeItemObserver = new MutationObserver(function () {
          if (activeItemUserSet) {
            return;
          }
          window.clearTimeout(activeItemRestoreTimer);
          activeItemRestoreTimer = window.setTimeout(function () {
            _self.restoreActiveMenuItem();
          }, 50);
        });

        // NOTE: only 'childList' is observed. Setting the class 'active' is
        // an ATTRIBUTE mutation and can NOT re-trigger the observer.
        activeItemObserver.observe(document.body, {
          childList: true,
          subtree:   true
        });

        // stop watching after all menus had a fair chance to load
        window.setTimeout(function () {
          if (activeItemObserver) {
            activeItemObserver.disconnect();
            activeItemObserver = null;
          }
        }, observeTime);
      }

      return true;
    }, // END initActiveMenuItems

    // -------------------------------------------------------------------------
    // Claude - Fix J1 Navigator issue #5
    // Inject a minimal default style for the marked parent items
    //
    // The class set by fix #4 needs a CSS rule to become VISIBLE. Call this
    // method (or set 'activeParentInjectStyle' to 'true') to get a working
    // default, or pass own CSS rules as the single argument:
    //
    //   j1.api.navigator.injectActiveParentStyle(
    //     'nav.navbar.navigator li[data-j1-active-parent] > a { color: red; }'
    //   );
    //
    // Returns 'false' if the style was injected before.
    // -------------------------------------------------------------------------
    injectActiveParentStyle: function (cssRules) {
      return j1NavInjectActiveParentStyle(cssRules);
    }, // END injectActiveParentStyle

    // -------------------------------------------------------------------------
    // Claude - Fix J1 Navigator issue #5
    // Report the state of the "active" item|parent management
    //
    // Diagnostic helper. Run it in the browser console to see WHAT the module
    // found and WHY an item is (not) marked:
    //
    //   j1.api.navigator.debugActiveItems();
    //
    // Returns a plain object, so the result can be inspected in the console
    // even if the logger is switched off.
    // -------------------------------------------------------------------------
    debugActiveItems: function (scopeSelector) {
      var scope  = scopeSelector || this.activeItemScopeSelector;
      var items  = j1NavCollectItems(scope);
      var config = j1NavParentConfig();
      var report = {};
      var index;

      report.currentPath   = j1NavNormalizePath(window.location.pathname);
      report.scope         = scope;
      report.itemsFound    = items.length;
      report.itemPaths     = [];
      report.markedItems   = $(scope).find('.dropdown-item.active').length;
      report.markedParents = $(scope).find('[' + config.marker + ']').length;
      report.parentEnabled = config.enabled;
      report.parentClass   = config.className;
      report.structural    = config.structural;

      for (index = 0; index < items.length; index++) {
        report.itemPaths.push(items[index].path);
      }

      report.matchedPath = j1NavBestMatch(
        items, report.currentPath, this.activeItemPrefixFallback
      );

      if (logger) {
        logger.info('\n' + 'active item report: '
          + JSON.stringify(report, undefined, 2));
      }

      return report;
    }, // END debugActiveItems

    // -------------------------------------------------------------------------
    // updateSidebar
    // Note:
    // -------------------------------------------------------------------------
    updateSidebar: function (user_data) {
      var logger = log4javascript.getLogger('j1.api.navigator.updateSidebar');
      var json_message;

//    json_message = JSON.stringify(user_data, undefined, 2);                   // multiline
      json_message = JSON.stringify(user_data);
      logText      = 'user state data: ' + json_message;
      logger.debug(logText);

      // replace macro placeholders to values
      j1.resolveMacros(user_data);
      // replace macro values only
      j1.updateMacros(user_data);

      return true;

    }, // END updateSidebar

  }; // end return (object)

}(window.j1.api.navigator || {}));