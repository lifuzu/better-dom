function fireEventFor(node, type) {
    var e = document.createEvent("HTMLEvents");

    e.initEvent(type, true, true);

    return node.dispatchEvent(e);
}

if (!Element.prototype.addEventListener) {
    HTMLDocument.prototype.addEventListener =
    Element.prototype.addEventListener = function(type, fCallback) {
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
}

// input event fix via propertychange
document.attachEvent("onfocusin", (function() {
    var legacyEventHandler = function() {
            if (capturedNode && capturedNode.value !== capturedNodeValue) {
                capturedNodeValue = capturedNode.value;
                // trigger special event that bubbles
                fireEventFor(capturedNode, "input");
            }
        },
        capturedNode, capturedNodeValue;

    if (document.createElement("input").oninput) {
        // IE9 doesn't fire oninput when text is deleted, so use
        // legacy onselectionchange event to detect such cases
        // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
        document.attachEvent("onselectionchange", legacyEventHandler);
    }

    return function() {
        var target = window.event.srcElement,
            type = target.type;

        if (capturedNode) {
            capturedNode.detachEvent("onpropertychange", legacyEventHandler);
            capturedNode = undefined;
        }

        if (type === "text" || type === "password" || type === "textarea") {
            (capturedNode = target).attachEvent("onpropertychange", legacyEventHandler);
        }
    };
})());
