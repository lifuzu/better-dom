if (!Element.prototype.addEventListener) {
    HTMLDocument.prototype.addEventListener =
    Element.prototype.addEventListener = function(type, fCallback) {
        var context = this,
            isCustomEvent = type === "submit" || !("on" + type in this);
        // IE8 doesn't support onscroll on document level
        if (this === document && type === "scroll") context = window;

        fCallback._ = function(e) {
            Object.defineProperty(e, "currentTarget", {
                get: function() { return context }
            });

            Object.defineProperty(e, "eventPhase", {
                get: function() {
                    return (e.srcElement === context) ? 2 : 3; // "AT_TARGET" = 2, "BUBBLING_PHASE" = 3
                }
            });

            var time = new Date(); // The current time when this anonymous function is called.

            Object.defineProperty(e, "timeStamp", {
                get: function() { return time }
            });

            if (!isCustomEvent || e.srcUrn === type) {
                fCallback.call(context, e);
            }
        };

        context.attachEvent("on" + (isCustomEvent ? "dataavailable" : type), fCallback._);
    };

    HTMLDocument.prototype.removeEventListener =
    Element.prototype.removeEventListener = function(type, fCallback) {
        var context = this,
            isCustomEvent = type === "submit" || !("on" + type in this);
        // IE8 doesn't support onscroll on document level
        if (this === document && type === "scroll") context = window;

        context.detachEvent("on" + (isCustomEvent ? "dataavailable" : type), fCallback._);
    };

    HTMLDocument.prototype.dispatchEvent =
    Element.prototype.dispatchEvent = function(e) {
        var isCustomEvent = e.type === "submit" || !("on" + e.type in this);
        // store original event type
        e.srcUrn = isCustomEvent ? e.type : undefined;

        this.fireEvent("on" + (isCustomEvent ? "dataavailable" : e.type), e);

        return e.returnValue !== false;
    };

    HTMLDocument.prototype.createEvent = function() {
        return document.createEventObject();
    };
}
