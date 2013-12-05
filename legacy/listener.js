if (!Element.prototype.addEventListener) {
    HTMLDocument.prototype.addEventListener =
    Element.prototype.addEventListener = function(type, fCallback) {
        var nodeWithListener = this;
        // IE8 doesn't support onscroll on document level
        if (this === document && type === "scroll") nodeWithListener = window;

        fCallback._ = function(e) {
            // Add some extensions directly to 'e' (the actual event instance)
            // Create the 'currentTarget' property (read-only)
            Object.defineProperty(e, "currentTarget", {
                get: function() { return nodeWithListener }
            });
            // Create the 'eventPhase' property (read-only)
            Object.defineProperty(e, "eventPhase", {
                get: function() {
                    return (e.srcElement === nodeWithListener) ? 2 : 3; // "AT_TARGET" = 2, "BUBBLING_PHASE" = 3
                }
            });
            // Create a 'timeStamp' (a read-only Date object)
            var time = new Date(); // The current time when this anonymous function is called.

            Object.defineProperty(e, "timeStamp", {
                get: function() { return time }
            });
            // Call the function handler callback originally provided...
            fCallback.call(nodeWithListener, e); // Re-bases 'this' to be correct for the callback.
        };

        nodeWithListener.attachEvent("on" + type, fCallback._);
    };

    HTMLDocument.prototype.removeEventListener =
    Element.prototype.removeEventListener = function(type, fCallback) {
        var nodeWithListener = this;
        // IE8 doesn't support onscroll on document level
        if (this === document && type === "scroll") nodeWithListener = window;

        nodeWithListener.detachEvent("on" + type, fCallback._);
    };
}
