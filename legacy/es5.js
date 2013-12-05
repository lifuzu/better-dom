Array.isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
};

Object.keys = Object.keys || function(obj) {
    var result = [], prop;

    for (prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) result.push(prop);
    }

    return result;
};

String.prototype.trim = (function() {
    var reTrim = /^\s+|\s+$/g;

    return function() {
        return this.replace(reTrim, "");
    };
}());

if (!Function.prototype.bind) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
