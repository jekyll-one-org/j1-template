/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/bsThemeSwitcher/js/switcher.js
 # Provides Javascript functions for Bootstrap ThemeSwitcher
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/jguadagno/ThemeSwitcher
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 # Copyright (C) 2014 Joseph Guadagno
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # Bootstrap Theme Switcher is licensed under the MIT License.
 # See: https://github.com/jguadagno/ThemeSwitcher
 # -----------------------------------------------------------------------------
 # NOTE: This modules is MODIFIED to be used with MobileMenu (mmenuLight).
 #       The original version cannot be used with J1 for theme menu creation!
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }]          */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-useless-escape: "off"                                            */
/* eslint no-prototype-builtins: "off"                                        */
/* eslint no-shadow-restricted-names: "off"                                   */
/* global jQuery                                                              */
/* global Cookies                                                             */
// -----------------------------------------------------------------------------

/**
* jQuery Twitter Bootstrap Theme Switcher v1.1.5
* https://github.com/jguadagno/ThemeSwitcher
*
* Copyright 2014, Joseph Guadagno
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
*/

'use strict';
;(function ($, window, document, undefined) {
  var cookie_names = j1.getCookieNames();
  var gaCookies    = j1.findCookie('_ga');
  var j1Cookies    = j1.findCookie('j1');
  var url          = new liteURL(window.location.href);
  var hostname     = url.hostname;
  var domain       = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
  var secure       = (url.protocol.includes('https')) ? true : false;
  var logger       = log4javascript.getLogger('j1.themes.switcher');
  var message      = {};

  var user_state;
  var user_state_json;
  var user_state_cookie;
  var user_state_detected;

  var menu_type;

  // Constructor
  // ---------------------------------------------------------------------------
  var ThemeSwitcher = function (element, options) {

    this.$element = $(element);
    this.settings = $.extend({}, $.fn.ThemeSwitcher.defaults, options);
    this.themesList = [];

    // loading local themes
    this.getThemes();
    return this;
  };

  // Prototype
  // ---------------------------------------------------------------------------
  ThemeSwitcher.prototype = {
    clear: function () {
      logger.debug('\n' + 'ThemeSwitcher.clear');
      return this.$element.each(function () {
        this.$element.empty();
      });
    },
    update: function () {
      logger.debug('\n' + 'ThemeSwitcher.update');
      this.getThemes();
    },

    // -------------------------------------------------------------------------
    //  checkStyleSheetByName
    // -------------------------------------------------------------------------
    checkStyleSheetByName: function (name) {
      var found   = false;
      var test    = '\/' + name + '\/';
      var re      = new RegExp(test, 'i');

      for(var i = 0; i < document.styleSheets.length; i++){
        if(re.test(document.styleSheets[i].href)){
          found=true;
          break;
        }
      }
      return found;
    },

    // -------------------------------------------------------------------------
    //  switchTheme
    // -------------------------------------------------------------------------
    // NOTE:
    // For J1 Theme, switchTheme set only the cookies contents. The theme
    // switch is done by a page reload. The reload triggers the theme_generator
    // to load theme CSS from cookies, finally.
    // -------------------------------------------------------------------------
    switchTheme: function (name, cssFile) {
      var $this      = $(this);
      var settings   = $.extend({}, $.fn.ThemeSwitcher.defaults, $this.data('ThemeSwitcher'));
      var id         = settings.cssThemeLink;
      var debug      = settings.debug;
      var includeCSS = this.settings.includeBootswatch;
      var themeName;
      var theme_css;

      // detect|set user state cookie
      user_state_detected = j1.existsCookie (cookie_names.user_state);
      if ( user_state_detected ) {
        logger.info('\n' + 'cookie found: ' + cookie_names.user_state);
        user_state = j1.readCookie(cookie_names.user_state);
      } else {
        logger.error('\n' + 'cookie not found: ' + cookie_names.user_state);
        logger.info('\n' + 'j1 cookies found:' + j1Cookies.length);
        j1Cookies.forEach(function (item) {console.log('j1.themes.switcher: ' + item);});
        logger.info('\n' + 'ga cookies found:' + gaCookies.length);
        gaCookies.forEach(function (item) {console.log('j1.themes.switcher: ' + item);});
      }

      themeName = user_state.theme_name;
      theme_css = user_state.theme_css;

      if (typeof cssFile === 'undefined') { cssFile = this.settings.defaultCssFile; }
      if (typeof name === 'undefined') { name = cssFile; }

      // check if theme is to be saved to cookie
      if (settings.saveToCookie) {
        if ( typeof Cookies === 'undefined' ) {
          if ( debug === 'true' ) {
            logger.error('\n' + 'cookies library not present');
          }
          return false;
        }

        user_state.theme_name  = name;
        user_state.theme_css   = cssFile;

        if (!(user_state.theme_name.includes('Uno') || user_state.theme_name == 'Bootstrap')) {
          user_state.theme_author        = 'Bootswatch';
          user_state.theme_author_url    = 'https://bootswatch.com/';
        } else {
          user_state.theme_author        = 'J1 Team';
          user_state.theme_author_url    = 'https://jekyll.one/';
        }

        logger.info('\n' + 'write to cookie : ' + cookie_names.user_state);
        j1.writeCookie({
          name: cookie_names.user_state,
          data: user_state,
          secure:   secure,
          expires:  365
        });

        // reload current page (skip cache)
        location.reload(true);
      } else {
        logger.info('\n' + 'write to cookie : disabled');
        logger.warn('\n' + 'selected theme not activated: ' + name);
      } // END if saveToCookie

    }, // END switchTheme

    // -------------------------------------------------------------------------
    //  loadThemeFromCookie
    // -------------------------------------------------------------------------
    loadThemeFromCookie: function (options) {

      if ( typeof Cookies === 'undefined' ) {
        logger.error('\n' + 'cookies library not present');
        return false;
      }

      var settings = $.extend({}, $.fn.ThemeSwitcher.defaults, options);

      // detect|set user state cookie
      user_state_detected = j1.existsCookie (cookie_names.user_state);

      if ( user_state_detected ) {
        logger.info('\n' + 'cookie found: ' + cookie_names.user_state);
        user_state = j1.readCookie(cookie_names.user_state);
      } else {
        logger.error('\n' + 'cookie not found: ' + cookie_names.user_state);
        logger.info('\n' + 'j1 cookies found:' + j1Cookies.length);
        j1Cookies.forEach(function (item) {console.log('j1.themes.switcher: ' + item);});
        logger.info('\n' + 'ga cookies found:' + gaCookies.length);
        gaCookies.forEach(function (item) {console.log('j1.themes.switcher: ' + item);});
      }

      var themeName = user_state.theme_name;
      var themeCss  = user_state.theme_css;
      this.switchTheme(themeName, themeCss);

    }, // END loadThemeFromCookie

    // -------------------------------------------------------------------------
    //  addTheme
    // -------------------------------------------------------------------------
    addTheme: function (name, cssFile, start, deleteCount) {
      if (typeof start === 'undefined') { start = 0; }
      if (typeof deleteCount === 'undefined') { deleteCount = 0; }
      this.themesList.splice(start, deleteCount, {name: name, css: cssFile});
      this.addThemesToControl();
    }, // END addTheme

    // -------------------------------------------------------------------------
    //  addThemesToControl
    // -------------------------------------------------------------------------
    addThemesToControl: function () {
      if (typeof this.$element === 'undefined') {
        logger.error('\n' + 'bootstrapThemeSelector|addThemesToControl: Element is undefined');
        return false;
      }
      if (typeof this.themesList === 'undefined') {
        logger.error('\n' + 'bootstrapThemeSelector|addThemesToControl: Themes is undefined');
        return false;
      }

      // if BootSwatch excludes are set
      if(this.settings.excludeBootswatch){
        var excludeBootswatchs;
        // split the string on ,
        if(this.settings.excludeBootswatch.indexOf(',') !== -1){
          excludeBootswatchs = this.settings.excludeBootswatch.replace(/ /g, '').split(',');
        } else {
          excludeBootswatchs = [];
          excludeBootswatchs.push(this.settings.excludeBootswatch);
        }

        var tempThemeList = this.themesList;
        $.each(tempThemeList, function (i, value) {
          if(value && value.name){
            if( $.inArray( value.name, excludeBootswatchs ) !== -1 ){
              tempThemeList.splice(i,1);
            }
          }
        });
        this.themesList = tempThemeList;
      }

      var base = this;

      if (this.$element.is('ul')) {
        var $this    = $(this);
        var settings = $.extend({}, $.fn.ThemeSwitcher.defaults, $this.data('ThemeSwitcher'));
        var id       = settings.cssThemeLink;
        var debug    = settings.debug;
        var themeName;

        // detect|set user state cookie
        user_state_detected = j1.existsCookie (cookie_names.user_state);
        if ( user_state_detected ) {
          logger.info('\n' + 'user state cookie found');
          user_state = j1.readCookie(cookie_names.user_state);
        } else {
          logger.error('\n' + 'user state NOT cookie found');
          logger.info('\n' + 'j1 cookies found:' + j1Cookies.length);
          j1Cookies.forEach(function (item) {console.log('j1.themes.switcher: ' + item);});
          logger.info('\n' + 'ga cookies found:' + gaCookies.length);
          gaCookies.forEach(function (item) {console.log('j1.themes.switcher: ' + item);});
        }

        themeName = user_state.theme_name;

        if ( debug === 'true' ) {
          logger.info('\n' + 'bootstrapThemeSelector: UL element selected');
        }
        this.$element.empty();

        var cssClass  = '';
        var iconColor = '#9E9E9E';
        $.each(this.themesList, function (i, value) {
          // Use DIFFERENT class for Mobile Menu
          if (base.$element[0].id.includes('mmenu')) {
            cssClass = 'mmenu-item';
          } else {
            cssClass = 'dropdown-item';
          }
          // Add class "active" to the current theme selected
          if (value.name === themeName) {
            // check Mobile Menu first
            if (base.$element[0].id.includes('mmenu')) {
              cssClass = 'mmenu-item active';
            } else {
              cssClass = 'dropdown-item active';
            }
          }

          var li = $('<li />')
            .attr('class', cssClass)
            .append('<a class="link-no-decoration" href="#"><i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: ' +iconColor+ '"></i>' +value.name+ '</a>')
            .on('click', function () {
              if (settings.loadFromBootswatch) {
                base.switchTheme(value.name, value.css);
              } else {
                base.switchTheme(value.name, value.cssCdn);
              }
              // remove previous "active" class and apply to latest clicked element
              $(this).parent().find('li').removeClass('active');
              $(this).addClass('active');
            });
            base.$element.append(li);
        }); // END $.each

        menu_type       = (base.$element[0].className.includes("dropdown-menu")) ? 'desktop'  : 'mobile';
        message.type    = 'state';
        message.action  = 'menu loaded for : ' + menu_type;
        message.text    = 'menu loaded on id: ' + base.$element[0].id;
        j1.sendMessage('ThemeSwitcher', 'j1.adapter.navigator', message);

        // END if element is 'ul'
      } else if (this.$element.is('select')) {
        logger.info('\n' + 'bootstrapThemeSelector: SELECT element selected');
        this.$element.empty();

        var optionSelectedMarker;
        $.each(this.themesList, function (i, value) {
          optionSelectedMarker = null;
          if ( value.name === themeName ) {
            optionSelectedMarker = 'selected';
          }
          if (settings.loadFromBootswatch) {
            base.$element.append('<option ' + optionSelectedMarker + ' value=\'' + value.css + '\'>' + value.name + '</option>');
          } else {
            base.$element.append('<option ' + optionSelectedMarker + ' value=\'' + value.cssCdn + '\'>' + value.name + '</option>');
          }
        });
        this.$element.on('change', function () {
          var optionSelected = $('option:selected', this);
          base.switchTheme(optionSelected.text(), optionSelected.val());
        });
        // END if element is 'select'
      } else {
        // no container found to add Theme list
        logger.info('\n' + 'bootstrapThemeSelector: no UL or SELECT element found');
        logger.error('\n' + 'bootstrapThemeSelector: failed');
        // console.warn('bootstrapThemeSelector only works with ul or select elements');
      } // END if
    }, // END addThemesToControl

    // -------------------------------------------------------------------------
    //  getThemes
    // -------------------------------------------------------------------------
    getThemes: function () {
      var base = this;

      if (this.settings.localFeed !== null && this.settings.localFeed !== '') {
        // Deferred loading themes from local themes (json file)
        $.ajax({
          url: this.settings.localFeed,
          // jadams 2016-10-10: removed the setting for sychronous XMLHttpRequest
          // async: false,
          dataType: 'json',
          success: function (data) {
            base.themesList = data.themes;
            base.addThemesToControl();
          },
          error: function (jqXHR, textStatus, errorThrown) {
            logger.error('\n' + 'failed to retrieve the local feed from: \'' + base.settings.localFeed + '\'');
          }
        });
      } else {
        // Deferred loading remote themes from Bootswatch API
        // -----------------------------------------------------------------------
        $.ajax({
          url:        this.settings.bootswatchApiUrl + '/' + this.settings.bootswatchApiVersion + '.json',
          // jadams 2016-10-10: removed the setting for sychronous XMLHttpRequest
          // async: false,
          dataType:   'json',
          success:    function (data) {
            if (typeof data.themes === 'undefined') {
              return null;
            }
            base.themesList = data.themes;
            base.themesList.splice(0,0, {name: 'default', css: base.settings.defaultCssFile});
            base.addThemesToControl();
          }
        });
      }
    }, // END getThemes

    // -------------------------------------------------------------------------
    //  themes
    // -------------------------------------------------------------------------
    themes : function (newThemeList) {
      if (typeof newThemeList === 'undefined') {
        return this.themesList;
      }
      else {
        // TODO: Set the associated control.
        this.themesList = newThemeList;
      }
    } // END themes

  }; // END prototype

  // Plugin definition
  // ---------------------------------------------------------------------------
  $.fn.ThemeSwitcher = function (option) {
    var args      = Array.prototype.slice.call(arguments, 1);
    var $this     = $(this);
    var data      = $this.data('ThemeSwitcher');
    var options   = typeof option === 'object' && option;
    var methodReturn;

    if (!data) {
      $this.data('ThemeSwitcher', (data = new ThemeSwitcher(this, options) ));
    }
    if (typeof option === 'string') {
      methodReturn = data[option].apply(data, args);
    }
    return (typeof methodReturn === 'undefined') ? $this : methodReturn;
  };

  $.fn.ThemeSwitcher.defaults = {
    debug:                  false,
    saveToCookie:           true,
    cssThemeLink:           'bootstrapTheme',
    cookieThemeName:        'bootstrapTheme.name',
    cookieThemeCss:         'boostrapTheme.css',
    cookieExpiration:       365,
    cookiePath:             '/',
    defaultCssFile:         'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css',
    bootswatchApiUrl:       'https://bootswatch.com/api/',
    bootswatchApiVersion:   '5',
    loadFromBootswatch:     true,
    localFeed:              '',
    excludeBootswatch:      ''
  };

  $.fn.ThemeSwitcher.Constructor = ThemeSwitcher;
})(jQuery, window, document);
