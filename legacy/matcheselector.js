// matchesSelector polyfill
if (!Element.prototype.matchesSelector && !Element.prototype.msMatchesSelector) {
    Element.prototype.matchesSelector = function(selector) {
        var els = document.querySelectorAll(selector), i, n;

        for (i = 0, n = els.length; i < n; ++i) {
            if (els[i] === this) return true;
        }

        return false;
    };
}
