# J1 Navigator Module — Developer Documentation

**Module:** `j1.adapter.navigator`
**Source:** `~/assets/theme/j1/adapter/js/navigator.js`
**License:** MIT — Copyright (C) 2023–2025 Juergen Adams
**Product:** [Jekyll One (J1 Template)](https://jekyll.one)

---

## Table of Contents

- [1. Overview](#1-overview)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Architecture](#12-architecture)
  - [1.3 Sub-Modules](#13-sub-modules)
  - [1.4 Technology Stack](#14-technology-stack)
- [2. Usage](#2-usage)
  - [2.1 Prerequisites](#21-prerequisites)
  - [2.2 Configuration Files](#22-configuration-files)
  - [2.3 Enabling the Navigator](#23-enabling-the-navigator)
  - [2.4 Resource Loading](#24-resource-loading)
  - [2.5 Customization Guide](#25-customization-guide)
- [3. Function Reference](#3-function-reference)
  - [3.1 init(options)](#31-initoptions)
  - [3.2 initAuthClient(auth_config)](#32-initauthclientauth_config)
  - [3.3 modalEventHandler(options)](#33-modaleventhandleroptions)
  - [3.4 applyThemeSettings(navDefaults, navBarOptions, navMenuOptions, navQuicklinksOptions)](#34-applythemesettingsnavdefaults-navbaroptions-navmenuoptions-navquicklinksoptions)
  - [3.5 applyNavigatorSettings(navDefaults, navBarOptions, navMenuOptions, navQuicklinksOptions)](#35-applynavigatorsettingsnavdefaults-navbaroptions-navmenuoptions-navquicklinksoptions)
  - [3.6 messageHandler(sender, message)](#36-messagehandlersender-message)
  - [3.7 setState(stat)](#37-setstatestat)
  - [3.8 getState()](#38-getstate)
- [4. Event Management](#4-event-management)
  - [4.1 Lifecycle Events](#41-lifecycle-events)
  - [4.2 Dependency Polling](#42-dependency-polling)
  - [4.3 Window Resize Event](#43-window-resize-event)
  - [4.4 Modal Events (Authentication)](#44-modal-events-authentication)
  - [4.5 Inter-Module Messaging](#45-inter-module-messaging)
  - [4.6 Theme Switcher Events](#46-theme-switcher-events)
- [5. Configuration Reference](#5-configuration-reference)
  - [5.1 General Settings](#51-general-settings)
  - [5.2 NavBar Options](#52-navbar-options)
  - [5.3 NavMenu Options (Desktop)](#53-navmenu-options-desktop)
  - [5.4 NavQuicklinks Options](#54-navquicklinks-options)
  - [5.5 NavMMenu Options (Mobile)](#55-navmmenu-options-mobile)
- [6. Dynamic CSS Injection](#6-dynamic-css-injection)
- [7. Module State Machine](#7-module-state-machine)
- [8. Troubleshooting](#8-troubleshooting)

---

## 1. Overview

### 1.1 Purpose

The J1 Navigator module is the central navigation component of the J1 Template
system for Jekyll-based static websites. It is responsible for creating,
configuring, and managing all navigation elements on a web page, including the
top navigation bar, desktop dropdown menus, mobile slide-in menus, quicklink
icon buttons, and authentication client UI.

The module acts as an **adapter layer** between the J1 core framework
(`j1.api.navigator`) and the template configuration system. It reads YAML-based
configuration, merges defaults with user overrides, loads HTML fragments via
AJAX, initializes sub-modules, applies dynamic CSS styling based on the active
theme, and orchestrates the interaction between the navigation system and other
J1 modules such as the Theme Switcher and Authentication Manager.

### 1.2 Architecture

The Navigator module follows a Liquid-processed JavaScript adapter pattern used
throughout the J1 Template system:

```
┌──────────────────────────────────────────────────────┐
│                  Liquid Pre-Processing                │
│  (YAML configs → Liquid vars → JavaScript injection)  │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│              j1.adapter.navigator (this module)       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ init()  →  AJAX Load  →  Core Init  →  Styling  │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ AuthClient│  │ModalEvents│  │ MessageHandler   │  │
│  └──────────┘  └───────────┘  └──────────────────┘  │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│              j1.api.navigator (Core Engine)            │
│  (Menu rendering, dropdown management, sticky nav)    │
└──────────────────────────────────────────────────────┘
```

The file is a Liquid template (processed by Jekyll at build time) that embeds
YAML configuration values directly into JavaScript variables. At runtime, the
generated JavaScript executes as a self-contained module registered under
`j1.adapter.navigator`.

### 1.3 Sub-Modules

The Navigator system is composed of five sub-modules, each independently
configurable:

| Sub-Module          | ID / Container                    | Purpose                                              |
|---------------------|-----------------------------------|------------------------------------------------------|
| **NavBar**          | `navigator_nav_navbar`            | Top navigation bar (branding, positioning, colors)   |
| **NavMenu**         | `navigator_nav_menu`              | Desktop dropdown menus (loaded via AJAX)              |
| **NavQuicklinks**   | `navigator_nav_quicklinks`        | Icon-based quick action buttons (search, translate)   |
| **NavMMenu**        | `navigator_nav_mmenu`             | Mobile slide-in menus (uses mmenu plugin)             |
| **NavAuthClient**   | Modals (`modalOmniSignIn`, etc.)  | Authentication sign-in/sign-out modals                |

### 1.4 Technology Stack

- **Jekyll / Liquid:** Build-time template processing for configuration injection
- **jQuery:** DOM manipulation, AJAX loading, event handling
- **Bootstrap 5:** Navbar component, modals, responsive grid breakpoints
- **mmenu.js:** Mobile menu plugin (slide-in navigation drawers)
- **log4javascript:** Structured logging throughout the module
- **J1 Core (`j1.*`):** Cookie management, state tracking, HTML loading, API surface

---

## 2. Usage

### 2.1 Prerequisites

The Navigator module requires the following to be available at runtime:

- **J1 Core** (`j1`) — provides `loadHTML()`, `getCookieNames()`, `readCookie()`,
  `getState()`, `appDetected()`, `authEnabled()`, and `xhrDOMState` tracking
- **jQuery** — for DOM operations and `$.extend()` configuration merging
- **log4javascript** — for structured logging
- **Bootstrap 5** — for navbar components and modal dialogs
- The Navigator Core engine at `j1.api.navigator`

### 2.2 Configuration Files

The Navigator uses a two-tier configuration system (defaults + user overrides):

| File                                          | Purpose                                           |
|-----------------------------------------------|---------------------------------------------------|
| `_data/modules/defaults/navigator.yml`        | Default configuration for all sub-modules         |
| `_data/modules/navigator.yml`                 | User-specific overrides and instance definitions  |
| `_data/modules/defaults/authentication.yml`   | Default authentication client configuration       |
| `_data/modules/authentication.yml`            | User authentication settings                      |
| `_data/modules/defaults/themes.yml`           | Default theme configuration                       |
| `_data/modules/themes.yml`                    | User theme settings                               |
| `_data/j1_config.yml`                         | Global J1 template settings                       |

Configuration merging follows the pattern:

```
Final Options = $.extend(true, {}, defaults, user_settings)
```

Defaults serve as a complete fallback; user settings need only specify the values
they wish to change.

### 2.3 Enabling the Navigator

In `_data/modules/navigator.yml`, set the top-level and per-sub-module `enabled`
flags to `true`:

```yaml
settings:
  enabled:              true

  nav_bar:
    enabled:            true

  nav_menu:
    enabled:            true

  nav_quicklinks:
    enabled:            true

  nav_mmenu:
    enabled:            true
```

### 2.4 Resource Loading

The Navigator is loaded by the J1 resource pipeline as defined in
`resources.yml`:

```yaml
id:                     navigator
files:                  [ adapter/js/navigator.js ]
init_function:          [ j1.adapter.navigator.init ]
```

The J1 core calls `j1.adapter.navigator.init()` during the page initialization
sequence. No manual invocation is required.

### 2.5 Customization Guide

**Changing Navigation Colors:**
Override color values in the user `navigator.yml` under `nav_bar`, `nav_menu`,
or `nav_quicklinks` sections. Colors accept CSS custom properties
(e.g., `var(--md-blue)`) or direct CSS color values.

**Adding Quicklink Buttons:**
Each quicklink is defined as a triplet of `*_icon`, `*_url` (or `*_action`),
and `*_label` entries. Link buttons navigate to URLs; action buttons trigger
JavaScript functions (e.g., `quicksearch`, `translate`, `cookie-consent`).

**Configuring Mobile Menus:**
Mobile menus are defined as instances under `nav_mmenu.menus`. Each instance
specifies an AJAX data source, drawer position (`left` or `right`), content
type (`navigation` or `drawer`), and activation button.

**Theme Integration:**
When `themes.enabled` is `true`, the Navigator automatically loads local and
remote theme switcher menus via the `ThemeSwitcher` jQuery plugin after the
navigator core is initialized.

---

## 3. Function Reference

### 3.1 init(options)

```javascript
j1.adapter.navigator.init(options)
```

**Purpose:** Primary entry point. Initializes the entire Navigator module,
loads all required HTML fragments via AJAX, starts the navigator core, loads
theme menus, applies configuration and theme styles, and sets up event handlers.

**Parameters:**

| Parameter   | Type     | Description                                          |
|-------------|----------|------------------------------------------------------|
| `options`   | Object   | Optional frontmatter options passed by J1 core       |

**Initialization Sequence:**

1. **Configuration Merge** — Merges navigator defaults with user settings for
   each sub-module (`navBar`, `navMenu`, `navQuicklinks`, `navAuthClient`)
   using `$.extend(true, {}, defaults, settings)`.

2. **Store Config** — Saves merged options on the adapter instance
   (`_this.navDefaults`, `_this.navBarOptions`, etc.) for later access by
   other functions.

3. **AJAX Loading** — Calls `j1.loadHTML()` three times to asynchronously
   load HTML fragments:
   - Quicklinks HTML
   - AuthClient modals HTML
   - Desktop menu HTML (sets state to `data_loaded` on completion)

4. **Dependency Wait: HTML Loaded** — Polls `j1.xhrDOMState` every 10ms
   until all three AJAX loads report `success`, then initializes
   `j1.api.navigator.init()` with defaults and menu options.

5. **Theme Menu Loading** (conditional) — If `themes.enabled` is `true`,
   waits for `navigatorCoreInitialized` then loads local and remote theme
   switcher menus via the `ThemeSwitcher` jQuery plugin.

6. **Final Initialization** — Polls every 10ms until the page content is
   visible (`#content` display is `block`), J1 core is `finished`, and
   (if themes enabled) themes are finished and both desktop theme menus
   are loaded. Then:
   - Calls `applyNavigatorSettings()`
   - Calls `applyThemeSettings()`
   - Initializes the auth client (if app detected and auth enabled)
   - Registers the `window.resize` event handler
   - Sets module state to `finished`
   - Logs initialization time

**State Transitions:** `not_started` → `started` → `finished`

**Returns:** `void` (asynchronous; completion signaled via state change)

---

### 3.2 initAuthClient(auth_config)

```javascript
j1.adapter.navigator.initAuthClient(auth_config)
```

**Purpose:** Initializes the authentication client portion of the Navigator.
Sets up modal event handlers and toggles the sign-in/sign-out icon and link
target in the quicklinks bar based on the current user session.

**Parameters:**

| Parameter      | Type     | Description                                      |
|----------------|----------|--------------------------------------------------|
| `auth_config`  | Object   | Merged authentication manager configuration      |

**Behavior:**

1. Calls `modalEventHandler(auth_config)` to bind click events on all
   authentication-related modal buttons.
2. Reads the current user session cookie.
3. If the user is authenticated:
   - Sets the quicklink sign-in/out button to target `#modalOmniSignOut`
   - Changes the icon from `mdib-login` to `mdib-logout`
4. If the user is not authenticated:
   - Sets the button to target `#modalOmniSignIn`
   - Changes the icon from `mdib-logout` to `mdib-login`

**Returns:** `true`

---

### 3.3 modalEventHandler(options)

```javascript
j1.adapter.navigator.modalEventHandler(options)
```

**Purpose:** Manages all button click events and modal lifecycle events for
the Bootstrap authentication modals (`modalOmniSignIn` and `modalOmniSignOut`).

**Parameters:**

| Parameter  | Type     | Description                                         |
|------------|----------|-----------------------------------------------------|
| `options`  | Object   | Authentication configuration containing `j1_auth`   |

**Internal State Objects:**

```javascript
signIn = {
  provider:        // First activated auth provider
  users:           // Allowed users for that provider
  do:              // Boolean flag set by signInButton click
}

signOut = {
  provider:        // First activated auth provider
  providerSignOut: // Whether to sign out from provider too (checkbox)
  do:              // Boolean flag set by signOutButton click
}
```

**Events Bound:**

| Element / Event                             | Behavior                                                                         |
|---------------------------------------------|----------------------------------------------------------------------------------|
| `ul.nav-pills > li` click                   | Captures selected auth provider name; resolves allowed users                     |
| `a.btn#signInButton` click                  | Sets `signIn.do = true`                                                          |
| `a.btn#signOutButton` click                 | Sets `signOut.do = true`                                                         |
| `input:checkbox[name=providerSignOut]` click| Toggles `signOut.providerSignOut`                                                |
| `#modalOmniSignOut` `show.bs.modal`         | Reads session cookie; populates modal with current provider info                 |
| `#modalOmniSignIn` `hidden.bs.modal`        | If `signIn.do`, redirects to `/authentication?request=signin&provider=...`       |
| `#modalOmniSignOut` `hidden.bs.modal`       | If `signOut.do`, redirects to `/authentication?request=signout&provider=...`     |

**Returns:** `true`

---

### 3.4 applyThemeSettings(navDefaults, navBarOptions, navMenuOptions, navQuicklinksOptions)

```javascript
j1.adapter.navigator.applyThemeSettings(navDefaults, navBarOptions, navMenuOptions, navQuicklinksOptions)
```

**Purpose:** Applies dynamic CSS styles derived from the currently active
theme. Reads the computed primary background color from the DOM and injects
`<style>` elements into the document `<head>` to style theme-dependent
elements.

**Parameters:**

| Parameter              | Type   | Description                           |
|------------------------|--------|---------------------------------------|
| `navDefaults`          | Object | Navigator default configuration       |
| `navBarOptions`        | Object | Merged NavBar options                 |
| `navMenuOptions`       | Object | Merged NavMenu options                |
| `navQuicklinksOptions` | Object | Merged NavQuicklinks options          |

**CSS Injections:**

| Target Element / Selector                                   | Properties Set                           |
|-------------------------------------------------------------|------------------------------------------|
| `.navbar-scrolled`                                          | `background-color`                       |
| `table`                                                     | `background` (body background)           |
| `.timeline > li > .timeline-panel:after`                    | `border-left`, `border-right`            |
| `.tmicon`                                                   | `background`                             |
| `.heading:after`                                            | `background`                             |
| `.tag-cloud ul li a`                                        | `background`                             |
| `.is-active-link::before`                                   | `background-color`                       |
| `.modal-dialog.modal-notify.modal-primary .modal-header`    | `background-color`                       |
| `.nav-pills .nav-link.active`                               | `background-color`                       |

**Returns:** `true`

---

### 3.5 applyNavigatorSettings(navDefaults, navBarOptions, navMenuOptions, navQuicklinksOptions)

```javascript
j1.adapter.navigator.applyNavigatorSettings(navDefaults, navBarOptions, navMenuOptions, navQuicklinksOptions)
```

**Purpose:** Applies dynamic CSS styles derived from the Navigator's own
configuration (as opposed to the theme). This function handles navbar item
colors, dropdown menu sizing and borders, quicklink icon colors, megamenu
fonts, and responsive breakpoint-specific styles.

**Parameters:** Same as `applyThemeSettings`.

**CSS Injections:**

| Target / Selector                                        | Properties Set                                                              |
|----------------------------------------------------------|-----------------------------------------------------------------------------|
| `li.nav-item > a`                                        | `color` (nav item)                                                          |
| `li.nav-item > a:hover`                                  | `color`, `background-image` (hover state)                                   |
| `li.dropdown.nav-item > a`                               | `color` (dropdown trigger)                                                  |
| `li.dropdown.nav-item > a:hover`                         | `color` (dropdown trigger hover)                                            |
| `.nav-icon` / `.nav-icon:hover`                          | `color` (quicklink icons)                                                   |
| `.navbar-brand > img`                                    | `height` (brand image)                                                      |
| `nav.navbar.navigator.navbar-transparent.light`          | `background-color`, `border-bottom` (multiple breakpoints)                  |
| `.quicklink-nav > ul > li > a`                           | `color` (quicklink anchors)                                                 |
| `.dropdown-menu > .active > a`                           | `background-color: transparent`                                             |
| `nav.navbar.navigator .dropdown-item:hover`              | `background` (hover color)                                                  |
| `nav.navbar.navigator ul.nav > li > a`                   | `color` (menu item color)                                                   |
| `nav.navbar.navigator li.dropdown ul.dropdown-menu`      | `max-height`, `animation-duration`, `min-width`, `border-top`, `border-radius` |
| `.dropdown-menu ul.dropdown-menu`                        | `left` (submenu offset), `top`, `max-height`                               |
| Raised dropdown (conditional)                            | `box-shadow`                                                                |
| `.megamenu-content .content ul.menu-col li a`            | `font-size`                                                                 |

**Responsive Breakpoints Used:**

| Variable               | Value    | Bootstrap Equivalent |
|------------------------|----------|----------------------|
| `gridBreakpoint_lg`    | `992px`  | Large                |
| `gridBreakpoint_md`    | `768px`  | Medium               |
| `gridBreakpoint_sm`    | `576px`  | Small                |

**Returns:** `true`

---

### 3.6 messageHandler(sender, message)

```javascript
j1.adapter.navigator.messageHandler(sender, message)
```

**Purpose:** Processes inter-module messages sent from other J1 components.
This is the Navigator's entry point for the J1 messaging system.

**Parameters:**

| Parameter  | Type     | Description                                  |
|------------|----------|----------------------------------------------|
| `sender`   | String   | Identifier of the sending module             |
| `message`  | Object   | Message payload (`type`, `action`, `text`)   |

**Handled Senders:**

| Sender                  | Condition                                          | Effect                                              |
|-------------------------|----------------------------------------------------|-----------------------------------------------------|
| `j1.navigator.core`    | `type === 'state'` and `action === 'core_initialized'` | Sets `navigatorCoreInitialized = true`          |
| `ThemeSwitcher`         | `action` contains `"desktop"` or `"mobile"`        | Sets corresponding `*Loaded` flags                  |

**Returns:** `true`

---

### 3.7 setState(stat)

```javascript
j1.adapter.navigator.setState(stat)
```

**Purpose:** Sets the current processing state of the module. Used internally
to track initialization progress.

**Parameters:**

| Parameter | Type   | Description            |
|-----------|--------|------------------------|
| `stat`    | String | New state value        |

**Returns:** `void`

---

### 3.8 getState()

```javascript
j1.adapter.navigator.getState()
```

**Purpose:** Returns the current processing state of the module.

**Returns:** `String` — one of `not_started`, `started`, or `finished`

---

## 4. Event Management

### 4.1 Lifecycle Events

The Navigator module uses a state-driven lifecycle, tracked via `setState()`
and `getState()`:

```
not_started  ──→  started  ──→  finished
     │                │              │
     │  init() called │  all deps   │  module fully
     │                │  resolved    │  operational
```

Other modules can poll `j1.adapter.navigator.getState()` to determine when
the Navigator is ready.

### 4.2 Dependency Polling

The module uses three `setInterval` loops (polling every 10ms) as a
dependency resolution mechanism:

| Interval Name                                  | Waits For                                                                                     | Then Executes                             |
|------------------------------------------------|-----------------------------------------------------------------------------------------------|-------------------------------------------|
| `dependencies_met_html_loaded`                 | All three AJAX loads (`xhrDOMState` === `'success'` for quicklinks, auth, menu containers)    | `j1.api.navigator.init()`                 |
| `dependencies_met_navigator_core_initialized`  | `navigatorCoreInitialized === true` (set by messageHandler)                                   | Theme switcher menu loading               |
| `dependencies_met_module_initialized`          | Page visible, J1 core finished, themes finished (if enabled), theme menus loaded              | Settings application, auth init, finalize |

Each interval calls `clearInterval()` upon resolution to stop polling.

### 4.3 Window Resize Event

After full initialization, the module registers a `resize` handler on `window`:

```javascript
$(window).on('resize', function () {
  j1.api.navigator.manageDropdownMenu(navDefaults, navMenuOptions);
  j1.api.navigator.navbarSticky();
  $(window).scrollTop($(window).scrollTop()+1);
  $(window).scrollTop($(window).scrollTop()-1);
});
```

This handler:
- Recalculates dropdown menu layout for the current viewport
- Recalculates sticky navbar behavior
- Triggers a 1px scroll bounce to force the table-of-contents (toccer)
  to recalculate its position

### 4.4 Modal Events (Authentication)

The `modalEventHandler` function binds to the following Bootstrap 5 modal
lifecycle events:

| Event                                   | Modal                | Action                                          |
|-----------------------------------------|----------------------|-------------------------------------------------|
| `show.bs.modal`                         | `#modalOmniSignOut`  | Reads session cookie, displays provider info    |
| `hidden.bs.modal`                       | `#modalOmniSignIn`   | If sign-in confirmed, redirects to auth route   |
| `hidden.bs.modal`                       | `#modalOmniSignOut`  | If sign-out confirmed, redirects to auth route  |

Authentication redirects follow the pattern:

```
/authentication?request=signin&provider={provider}&allowed_users={users}
/authentication?request=signout&provider={provider}&provider_signout={bool}
```

### 4.5 Inter-Module Messaging

The `messageHandler` receives messages from other J1 modules. The message
format is:

```javascript
{
  type:   "state",           // Message category
  action: "core_initialized", // Specific action/event
  text:   "..."              // Human-readable description
}
```

The Navigator currently handles messages from two senders:

- **`j1.navigator.core`** — signals that the core navigation engine has
  finished initialization
- **`ThemeSwitcher`** — signals that local or remote theme menus have been
  loaded (for both desktop and mobile variants)

### 4.6 Theme Switcher Events

When themes are enabled, the Navigator tracks four loading states via the
message handler:

| Flag                         | Set When                                    |
|------------------------------|---------------------------------------------|
| `desktopThemesLocalLoaded`   | ThemeSwitcher sends desktop + local_themes  |
| `desktopThemesRemoteLoaded`  | ThemeSwitcher sends desktop + remote_themes |
| `mobileThemesLocalLoaded`    | ThemeSwitcher sends mobile + local_themes   |
| `mobileThemesRemoteLoaded`   | ThemeSwitcher sends mobile + remote_themes  |

The final initialization step waits for both desktop theme flags before
completing.

---

## 5. Configuration Reference

### 5.1 General Settings

| Key                  | Type    | Default          | Description                                |
|----------------------|---------|------------------|--------------------------------------------|
| `enabled`            | Boolean | `false`          | Master enable/disable for the module       |
| `icon_family`        | String  | `mdib`           | Icon font family (mdib or fa)              |
| `icon_style`         | String  | `mdib`           | Icon style (mdi, far, fas, fab)            |
| `icon_color`         | String  | `mdib-grey`      | Default icon color class                   |
| `icon_size`          | String  | `mdib-sm`        | Default icon size class                    |
| `nav_primary_color`  | String  | `var(--md-blue)` | Primary accent color for all nav elements  |

### 5.2 NavBar Options

| Key                            | Default                          | Description                              |
|--------------------------------|----------------------------------|------------------------------------------|
| `container_id`                 | `navigator_nav_navbar`           | DOM container ID                         |
| `translation`                  | `notranslate`                    | Google Translate class                   |
| `media_breakpoint`             | `lg`                             | Bootstrap breakpoint for collapse        |
| `brand_position`               | `right`                          | Brand logo position (`left` or `right`)  |
| `brand_type`                   | `image`                          | Brand display type (`image` or `text`)   |
| `brand_type_collapsed`         | `text`                           | Brand type when navbar is collapsed      |
| `fixed`                        | `true`                           | Whether navbar is fixed to top           |
| `style`                        | `overlay`                        | Navbar style                             |
| `color`                        | `light`                          | Color scheme (`light` or `dark`)         |
| `nav_item_color`               | `var(--md-gray-900)`             | Nav link text color                      |
| `nav_item_color_hover`         | `var(--md-gray-300)`             | Nav link hover text color                |
| `nav_item_background_image`    | Linear gradient                  | Nav link hover background gradient       |
| `bottom_line_height`           | `1`                              | Bottom border height (px)                |
| `bottom_line_color`            | `var(--md-gray-300)`             | Bottom border color                      |
| `background_color_full`        | `rgba(255, 255, 255, 0.8)`      | Background color when at top of page     |
| `background_color_scrolled`    | `var(--md-blue)`                 | Background color when scrolled           |

### 5.3 NavMenu Options (Desktop)

| Key                                 | Default                    | Description                                |
|-------------------------------------|----------------------------|--------------------------------------------|
| `xhr_container_id`                  | `navigator_nav_menu`       | Container for AJAX-loaded menu HTML        |
| `xhr_data_element`                  | `desktop_menu`             | Data element identifier in HTML fragment   |
| `xhr_data_path`                     | `/assets/data/menu/...`    | URL path to menu HTML fragment             |
| `raised_level`                      | `5`                        | Shadow elevation level                     |
| `delay_menu_open`                   | `200`                      | Hover-to-open delay (ms)                   |
| `max_height`                        | `600`                      | Maximum dropdown height (px)               |
| `menu_font_size`                    | `larger`                   | Top-level menu font size                   |
| `megamenu_font_size`                | `small`                    | Megamenu content font size                 |
| `menu_item_color`                   | `var(--md-gray-900)`       | Menu item text color                       |
| `menu_item_color_hover`             | `var(--md-gray-300)`       | Menu item hover color                      |
| `dropdown_style`                    | `raised`                   | Dropdown shadow style (`raised` or `flat`) |
| `dropdown_color`                    | `var(--md-blue)`           | Dropdown accent color                      |
| `dropdown_item_min_width`           | `15`                       | Minimum dropdown width (rem)               |
| `dropdown_menu_max_height`          | `35`                       | Maximum dropdown height (rem)              |
| `dropdown_font_size`                | `small`                    | Dropdown item font size                    |
| `dropdown_padding_x`               | `18`                       | Horizontal padding (rem)                   |
| `dropdown_padding_y`               | `10`                       | Vertical padding (px)                      |
| `dropdown_item_color`              | `var(--md-gray-900)`       | Dropdown item text color                   |
| `dropdown_border_color`            | `var(--md-blue)`           | Dropdown border color                      |
| `dropdown_border_top`              | `0`                        | Top border width (px)                      |
| `dropdown_border_radius`           | `2`                        | Border radius (px)                         |
| `dropdown_background_color_hover`  | `var(--md-gray-300)`       | Item hover background                      |
| `dropdown_background_color_active` | `var(--md-gray-500)`       | Item active background                     |
| `dropdown_animate`                 | `false`                    | Enable dropdown animation                  |
| `dropdown_animate_in`              | `slideInDown`              | Animation class (in)                       |
| `dropdown_animate_out`             | `fadeOutDown`              | Animation class (out)                      |
| `dropdown_animate_duration`        | `.75`                      | Animation duration (seconds)               |

### 5.4 NavQuicklinks Options

| Key                    | Default                  | Description                               |
|------------------------|--------------------------|-------------------------------------------|
| `xhr_container_id`     | `navigator_nav_quicklinks` | AJAX container ID                       |
| `xhr_data_element`     | `quicklinks`             | Data element identifier                   |
| `xhr_data_path`        | `/assets/data/quicklinks/...` | URL path to quicklinks HTML          |
| `icon_family`          | `mdib`                   | Icon font family                          |
| `icon_color`           | `var(--md-gray-900)`     | Default icon color                        |
| `icon_color_hover`     | `var(--md-gray-500)`     | Hover icon color                          |
| `icon_size`            | `mdib-2x`               | Icon size class                           |
| `home_icon/url/label`  | `home-variant` / `/`     | Home button configuration                 |
| `quicksearch_icon`     | `magnify`                | Search action button icon                 |
| `cookies_icon`         | `cookie`                 | Cookie consent action icon                |
| `translate_icon`       | `google-translate`       | Google Translate action icon               |
| `theme_toggler_icon`   | `lightbulb-outline`      | Theme toggler action icon                 |

Link buttons (`*_url`) navigate to URLs. Set to `none` to hide. Action
buttons (`*_action`) trigger JavaScript functions registered in the J1
quicklinks handler.

### 5.5 NavMMenu Options (Mobile)

Mobile menus are defined as an array of instances under `nav_mmenu.menus`.
Each instance configures:

| Key                  | Description                                                  |
|----------------------|--------------------------------------------------------------|
| `xhr_container_id`   | Container for AJAX-loaded mobile menu HTML                   |
| `xhr_data_element`   | Data element in the HTML fragment                            |
| `xhr_data_path`      | URL path to the HTML fragment                                |
| `drawer.position`    | Slide-in direction (`left` or `right`)                       |
| `content.id`         | Content identifier                                           |
| `content.type`       | `navigation` (full menu) or `drawer` (panel)                 |
| `content.title`      | Display title in the mobile menu header                      |
| `content.theme`      | Color theme (`dark` or `light`)                              |
| `content.button`     | CSS selector for the trigger button                          |
| `content.button_activated` | Activation condition (`always` or CSS class to detect) |

Standard instances include the main navigation menu, a table-of-contents
drawer, and an optional sidebar info drawer.

---

## 6. Dynamic CSS Injection

The Navigator injects CSS dynamically at runtime via two functions. This
approach allows theme colors and configuration values to be applied without
recompiling SCSS.

All injected styles use `<style>` elements appended to `<head>` and use
`!important` to override static stylesheet rules. Many styles are wrapped in
`@media screen` queries to apply only above specific Bootstrap breakpoints.

**Why dynamic injection?**
Because the active theme (and its colors) can change at runtime via the
ThemeSwitcher, the Navigator must re-derive colors from computed DOM values
(e.g., reading `$('#bg-primary').css('background-color')`) rather than relying
on build-time SCSS variables alone.

---

## 7. Module State Machine

```
┌─────────────┐   init() called    ┌─────────┐   all deps met     ┌──────────┐
│ not_started  │ ────────────────→  │ started  │ ────────────────→  │ finished │
└─────────────┘                    └─────────┘                    └──────────┘
```

- **`not_started`** — Module is registered but `init()` has not been called.
- **`started`** — `init()` has been called; AJAX loads and dependency
  resolution are in progress.
- **`finished`** — All sub-modules are initialized, styles are applied, and
  event handlers are registered. The module is fully operational.

Other J1 modules should wait for the `finished` state before interacting
with navigator elements.

---

## 8. Troubleshooting

**Module stays in `started` state:**
Check that all three AJAX endpoints (`xhr_data_path` for quicklinks,
auth client, and menu) are returning valid HTML. Inspect
`j1.xhrDOMState` in the browser console.

**Theme colors not applied:**
Ensure the `#bg-primary` element exists in the DOM and has a computed
background color. The Navigator reads this element to derive the primary
theme color.

**Dropdowns not responsive:**
The resize event handler calls `j1.api.navigator.manageDropdownMenu()`.
If dropdowns misbehave after window resize, check that the navigator core
API is properly loaded.

**Authentication modals not working:**
Verify that `j1.appDetected()` and `j1.authEnabled()` both return `true`.
The auth client is only initialized when both conditions are met.

**Theme menus not loading:**
The module waits for both `desktopThemesLocalLoaded` and
`desktopThemesRemoteLoaded` flags. If either ThemeSwitcher feed fails,
the Navigator will not reach `finished` state.
