// input event fix via propertychange
var capturedNode, capturedNodeValue,
    legacyEventHandler = function() {
        if (capturedNode && capturedNode.value !== capturedNodeValue) {
            capturedNodeValue = capturedNode.value;

            var e = document.createEvent("HTMLEvents");
            // trigger event that bubbles
            e.initEvent("input", true, true);

            capturedNode.dispatchEvent(e);
        }
    };

if (document.createElement("input").oninput) {
    // IE9 doesn't fire oninput when text is deleted, so use
    // legacy onselectionchange event to detect such cases
    // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
    document.attachEvent("onselectionchange", legacyEventHandler);
}

document.attachEvent("onfocusin", function() {
    var target = window.event.srcElement,
        type = target.type;

    if (capturedNode) {
        capturedNode.detachEvent("onpropertychange", legacyEventHandler);
        capturedNode = undefined;
    }

    if (type === "text" || type === "password" || type === "textarea") {
        (capturedNode = target).attachEvent("onpropertychange", legacyEventHandler);
    }
});
