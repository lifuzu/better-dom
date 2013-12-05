function fireEventFor(node, type) {
    var e = document.createEvent("HTMLEvents");

    e.initEvent(type, true, true);

    return node.dispatchEvent(e);
}

if (!Element.prototype.addEventListener) {
    HTMLDocument.prototype.addEventListener =
    Element.prototype.addEventListener =
    Window.prototype.addEventListener = function(type, fCallback) {
        var context = this,
            isCustomEvent = type === "submit" || !("on" + type in this);
        // IE8 doesn't support onscroll on document level
        if (this === document && type === "scroll") context = window;

        fCallback._ = function(e) {
            Object.defineProperty(e, "currentTarget", {
                get: function() {
                    return context;
                }
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
    Element.prototype.removeEventListener =
    Window.prototype.removeEventListener = function(type, fCallback) {
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

    // submit event bubbling fix
    document.attachEvent("onkeydown", function() {
        var e = window.event,
            target = e.srcElement,
            form = target.form;

        if (form && target.type !== "textarea" && e.keyCode === 13 && e.returnValue !== false) {
            fireEventFor(form, "submit");

            return false;
        }
    });

    document.attachEvent("onclick", (function() {
        var handleSubmit = function() {
                var form = window.event.srcElement;

                form.detachEvent("onsubmit", handleSubmit);

                fireEventFor(form, "submit");

                return false;
            };

        return function() {
            var target = window.event.srcElement,
                form = target.form;

            if (form && target.type === "submit") {
                form.attachEvent("onsubmit", handleSubmit);
            }
        };
    })());

    // DOMContentLoaded inplementation
    (function() {
        var testDiv = document.createElement("div"),
            isTop, scrollIntervalId;

        try {
            isTop = window.frameElement === null;
        } catch (e) {}

        // DOMContentLoaded approximation that uses a doScroll, as found by
        // Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
        // but modified by other contributors, including jdalton
        if (testDiv.doScroll && isTop && window.external) {
            scrollIntervalId = setInterval(function () {
                var trigger = true;

                try {
                    testDiv.doScroll();
                } catch (e) {
                    trigger = false;
                }

                if (trigger) {
                    clearInterval(scrollIntervalId);

                    fireEventFor(document, "DOMContentLoaded");
                }
            }, 30);
        }
    }());
}
