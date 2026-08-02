/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/mmenu/js/modules/match-media-toggler.js
 # Mobile Menu Light implementation for J1 Theme v3.2.2
 #  
 # Product/Info:
 # https://jekyll.one
 # https://github.com/FrDH/mmenu-light
 #
 # Copyright (C) 2023-2026 Juergen Adams
 # Copyright (C) 2015-2021 Fred Heusschen
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Mmenu Light is licensed under the CC-BY-4.0 License.
 # See: http://creativecommons.org/licenses/by/4.0/
 # -----------------------------------------------------------------------------
*/

/**
 * Class for a match media toggler.
 */
var MmToggler = /** @class */ (function () {
    /**
     * Create the match media.
     *
     * @param {string} mediaquery Media query to use.
     */
    function MmToggler(mediaquery) {
        var _this = this;
        this.listener = function (evnt) {
            (evnt.matches ? _this.matchFns : _this.unmatchFns).forEach(function (listener) {
                listener();
            });
        };
        this.toggler = window.matchMedia(mediaquery);
        this.toggler.addListener(this.listener);
        this.matchFns = [];
        this.unmatchFns = [];
    }
    /**
     * Add a function to the list,
     * also fires the added function.
     *
     * @param {Function} match      Function to fire when the media query matches.
     * @param {Function} unmatch    Function to fire when the media query does not match.
     */
    MmToggler.prototype.add = function (match, unmatch) {
        this.matchFns.push(match);
        this.unmatchFns.push(unmatch);
        (this.toggler.matches ? match : unmatch)();
    };
    return MmToggler;
}());
export default MmToggler;
