/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/cookieConsent/js/cookieConsent.js
 # Provides JS Core for J1 Module BS Cookie Consent
 #
 #  Product/Info:
 #  https://shaack.com
 #  http://jekyll.one
 #
 #  Copyright (C) 2020 Stefan Haack
 #  Copyright (C) 2021 Juergen Adams
 #
 #  bootstrap-cookie-banner is licensed under MIT License.
 #  See: https://github.com/shaack/bootstrap-cookie-banner/blob/master/LICENSE
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 # TODO:
 #
 # -----------------------------------------------------------------------------
 # NOTE:
 #  BS Cookie Consent is an MODIFIED version of bootstrap-cookie-banner
 #  for the use with J1 Template. This modiefied version cannot be used
 #  outside of J1 Template!
  # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint indent: "off"                                                       */
/* eslint JSUnfilteredForInLoop: "off"                                        */
// -----------------------------------------------------------------------------

function BootstrapCookieConsent(c) {
    var g;
    var e;
    var q;
    var r = log4javascript.getLogger("j1.core.bsCookieConsent");
    var p = "bccs-modal";
    var l = this;
    var n = false;
    this.props = {
        autoShowDialog: true,
        language: navigator.language,
        languages: ["en", "de"],
        contentURL: "./content",
        cookieName: "cookie-consent-settings",
        cookieStorageDays: 365,
        postSelectionCallback: undefined,
        whitelisted: [],
        xhr_data_element: ""
    };
    for (var d in c) {
        this.props[d] = c[d]
    }
    this.language = this.props.language;
    if (this.language.indexOf("-") !== -1) {
        this.language = this.language.split("-")[0]
    }
    if (!this.props.languages.includes(this.language)) {
        this.language = this.props.languages[0]
    }
    var f = {
        set: function(u, v, x) {
            var w = window.btoa(v);
            var s = "";
            if (x) {
                var t = new Date();
                t.setTime(t.getTime() + (x * 24 * 60 * 60 * 1000));
                s = "; expires=" + t.toUTCString()
            }
            document.cookie = u + "=" + (w || "") + s + "; Path=/; SameSite=Strict;"
        },
        get: function(t) {
            var w = t + "=";
            var s = document.cookie.split(";");
            for (var u = 0; u < s.length; u++) {
                var y = s[u];
                while (y.charAt(0) === " ") {
                    y = y.substring(1, y.length)
                }
                if (y.indexOf(w) === 0) {
                    var x = y.substring(w.length, y.length);
                    var v = window.atob(x);
                    return v
                }
            }
            return undefined
        }
    };
    var k = {
        documentReady: function(s) {
            if (document.readyState !== "loading") {
                s()
            } else {
                document.addEventListener("DOMContentLoaded", s)
            }
        }
    };
    function j(s) {
        k.documentReady(function() {
            l.modal = document.getElementById(p);
            if (!l.modal) {
                l.modal = document.createElement("div");
                l.modal.id = p;
                l.modal.setAttribute("class", "modal fade");
                l.modal.setAttribute("tabindex", "-1");
                l.modal.setAttribute("role", "dialog");
                l.modal.setAttribute("aria-labelledby", p);
                document.body.append(l.modal);
                l.$modal = $(l.modal);
                if (l.props.postSelectionCallback) {
                    l.$modal.on("hidden.bs.modal", function() {
                        l.props.postSelectionCallback()
                    })
                }
                var t = l.props.contentURL + "/index.html";
                $.get(t).done(function(u) {
                    l.modal.innerHTML = u;
                    l.modal.innerHTML = $("#" + l.props.xhr_data_element).eq(0).html();
                    $(l.modal).modal({
                        backdrop: "static",
                        keyboard: false
                    });
                    l.$buttonDoNotAgree = $("#bccs-buttonDoNotAgree");
                    l.$buttonAgree = $("#bccs-buttonAgree");
                    l.$buttonSave = $("#bccs-buttonSave");
                    l.$buttonAgreeAll = $("#bccs-buttonAgreeAll");
                    i();
                    h();
                    $("#bccs-options").on("hide.bs.collapse", function() {
                        n = false;
                        i()
                    }).on("show.bs.collapse", function() {
                        n = true;
                        i()
                    });
                    l.$buttonDoNotAgree.click(function() {
                        b()
                    });
                    l.$buttonAgree.click(function() {
                        m()
                    });
                    l.$buttonSave.click(function() {
                        $("#bccs-options").collapse("hide");
                        o();
                        h()
                    });
                    l.$buttonAgreeAll.click(function() {
                        $("#bccs-options").collapse("hide");
                        m();
                        h()
                    })
                }).fail(function() {
                    r.error("You probably need to set `contentURL` in the props")
                })
            } else {
                l.$modal.modal("show")
            }
        }
        .bind(this))
    }
    function h() {
        var u = l.getSettings();
        if (u) {
            for (var t in u) {
                var s = l.$modal.find("#bccs-options .bccs-option[data-name='" + t + "'] input[type='checkbox']");
                s.prop("checked", u[t])
            }
        }
    }
    function i() {
        if (n) {
            l.$buttonDoNotAgree.hide();
            l.$buttonAgree.hide();
            l.$buttonSave.show();
            l.$buttonAgreeAll.show()
        } else {
            l.$buttonDoNotAgree.show();
            l.$buttonAgree.show();
            l.$buttonSave.hide();
            l.$buttonAgreeAll.hide()
        }
    }
    function a(t) {
        var s = l.$modal.find("#bccs-options .bccs-option");
        var v = {};
        for (var w = 0; w < s.length; w++) {
            var y = s[w];
            var u = y.getAttribute("data-name");
            if (u === "necessary") {
                v[u] = true
            } else {
                if (t === undefined) {
                    var x = $(y).find("input[type='checkbox']");
                    v[u] = x.prop("checked")
                } else {
                    v[u] = !!t
                }
            }
        }
        return v
    }
    function m() {
        f.set(l.props.cookieName, JSON.stringify(a(true)), l.props.cookieStorageDays);
        l.$modal.modal("hide")
    }
    function b() {
        f.set(l.props.cookieName, JSON.stringify(a(false)), l.props.cookieStorageDays);
        r.warn("delete cookies: all");
        j1.deleteCookie("all");
        l.$modal.modal("hide");
        j1.goHome()
    }
    function o() {
        f.set(l.props.cookieName, JSON.stringify(a()), l.props.cookieStorageDays);
        l.$modal.modal("hide")
    }
    q = (this.props.whitelisted.indexOf(window.location.pathname) > -1);
    if (f.get(this.props.cookieName) === undefined && this.props.autoShowDialog && !q) {
        j()
    }
    this.showDialog = function() {
        q = (this.props.whitelisted.indexOf(window.location.pathname) > -1);
        if (!q) {
            j()
        }
    }
    ;
    this.getSettings = function(t) {
        var s = f.get(l.props.cookieName);
        if (s) {
            var u = JSON.parse(f.get(l.props.cookieName));
            if (t === undefined) {
                return u
            } else {
                if (u) {
                    return u[t]
                } else {
                    return false
                }
            }
        } else {
            return undefined
        }
    }
}
;
