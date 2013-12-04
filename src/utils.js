var DOM = require("./dom"),
    makeLoopMethod = (function(){
        var rcallback = /cb\.call\(([^)]+)\)/g,
            defaults = {
                BEFORE: "",
                COUNT:  "a ? a.length : 0",
                BODY:   "",
                AFTER:  ""
            };

        return function(options) {
            var code = "%BEFORE%\nfor(var i=0,n=%COUNT%;i<n;++i){%BODY%}%AFTER%", key;

            for (key in defaults) {
                code = code.replace("%" + key + "%", options[key] || defaults[key]);
            }

            // improve callback invokation by using call on demand
            code = code.replace(rcallback, function(expr, args) {
                return "(that?" + expr + ":cb(" + args.split(",").slice(1).join() + "))";
            });

            return Function("a", "cb", "that", "undefined", code);
        };
    })();

module.exports = {
    trim: (function() {
        var reTrim = /^\s+|\s+$/g;

        return function(str) {
            return String.prototype.trim ? str.trim() : str.replace(reTrim, "");
        };
    }()),
    makeError: function(method, el) {
        var type = el === DOM ? "DOM" : "$Element";

        return "Error: " + type + "." + method + " was called with illegal arguments. Check <%= pkg.docs %>/" + type + ".html#" + method + " to verify the function call";
    },

    // OBJECT UTILS

    forOwn: (function() {
        if (Object.keys) {
            return makeLoopMethod({
                BEFORE: "var keys = Object.keys(a), k",
                COUNT:  "keys.length",
                BODY:   "k = keys[i]; cb.call(that, a[k], k, a)"
            });
        } else {
            return function(obj, callback, thisPtr) {
                for (var prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) callback.call(thisPtr, obj[prop], prop, obj);
                }
            };
        }
    }()),
    keys: Object.keys || (function() {
        var collectKeys = function(value, key) { this.push(key); };

        return function(obj) {
            var result = [];

            this.forOwn(obj, collectKeys, result);

            return result;
        };
    }()),
    extend: function(obj, mixins) {
        this.forOwn(mixins || {}, function(value, key) { obj[key] = value });

        return obj;
    },

    // COLLECTION UTILS

    forEach: makeLoopMethod({
        BODY:   "cb.call(that, a[i], i, a)",
        AFTER:  "return a"
    }),
    map: makeLoopMethod({
        BEFORE: "var out = Array(a && a.length || 0)",
        BODY:   "out[i] = cb.call(that, a[i], i, a)",
        AFTER:  "return out"
    }),
    some: makeLoopMethod({
        BODY:   "if (cb.call(that, a[i], i, a) === true) return true",
        AFTER:  "return false"
    }),
    filter: makeLoopMethod({
        BEFORE: "var out = []",
        BODY:   "if (cb.call(that, a[i], i, a)) out.push(a[i])",
        AFTER:  "return out"
    }),
    foldl: makeLoopMethod({
        BEFORE: "if (a && arguments.length < 2) that = a[0]",
        BODY:   "that = cb(that, a[arguments.length < 2 ? i + 1 : i], i, a)",
        AFTER:  "return that"
    }),
    foldr: makeLoopMethod({
        BEFORE: "var j; if (a && arguments.length < 2) that = a[a.length - 1]",
        BODY:   "j = n - i - 1; that = cb(that, a[arguments.length < 2 ? j - 1 : j], j, a)",
        AFTER:  "return that"
    }),
    every: makeLoopMethod({
        BEFORE: "var out = true",
        BODY:   "out = cb.call(that, a[i], i, a) && out",
        AFTER:  "return out"
    }),
    legacy: makeLoopMethod({
        BEFORE: "that = a",
        BODY:   "cb.call(that, a[i]._node, a[i], i)",
        AFTER:  "return a"
    }),
    slice: function(list, index) {
        return Array.prototype.slice.call(list, index | 0);
    },
    isArray: Array.isArray || function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    },

    // DOM UTILS

    getComputedStyle: function(el) {
        return window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;
    },
    parseFragment: (function() {
        var parser = document.createElement("body");

        return function(html) {
            var fragment = document.createDocumentFragment();

            // fix NoScope bug
            parser.innerHTML = html;

            while (parser.firstChild) fragment.appendChild(parser.firstChild);

            return fragment;
        };
    })(),
    requestAnimationFrame: (function() {
        var lastTime = 0;

        return window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || function(callback) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime));

            lastTime = currTime + timeToCall;

            if (timeToCall) {
                setTimeout(callback, timeToCall);
            } else {
                callback(currTime + timeToCall);
            }
        };
    }())
};
