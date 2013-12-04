if (!Element.prototype.addEventListener) {
    var docEl = document.documentElement,
        buttonGetter = Object.getOwnPropertyDescriptor(Event.prototype, "button").get;

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

    // Extend Event.prototype with a few of the W3C standard APIs on Event
    Object.defineProperty(Event.prototype, "target", {
        get: function() {
            return this.srcElement;
        }
    });
    Object.defineProperty(Event.prototype, "relatedTarget", {
        get: function() {
            return this[(this.toElement === this.currentTarget ? "from" : "to") + "Element"];
        }
    });
    Object.defineProperty(Event.prototype, "defaultPrevented", {
        get: function() {
            return this.returnValue === false;
        }
    });
    Object.defineProperty(Event.prototype, "which", {
        get: function() {
            return this.keyCode;
        }
    });
    Object.defineProperty(Event.prototype, "button", {
        get: function() {
            var button = buttonGetter.call(this);
            // click: 1 === left; 2 === middle; 3 === right
            return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
        }
    });
    Object.defineProperty(Event.prototype, "pageX", {
        get: function() {
            return this.clientX + docEl.scrollLeft - docEl.clientLeft;
        }
    });
    Object.defineProperty(Event.prototype, "pageY", {
        get: function() {
            return this.clientY + docEl.scrollTop - docEl.clientTop;
        }
    });
    Event.prototype.stopPropagation = function () {
        this.cancelBubble = true;
    };
    Event.prototype.preventDefault = function () {
        this.returnValue = false;
    };
}
