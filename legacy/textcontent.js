// textContent fix

var descr = Object.getOwnPropertyDescriptor(Element.prototype, "textContent"),
    innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");

if (descr && !descr.get) {
    Object.defineProperty(Element.prototype, "textContent", {
        // It won't work if you just drop in innerText.get
        // and innerText.set or the whole descriptor.
        get: function() {
            return innerText.get.call(this);
        },
        set: function(value) {
            return innerText.set.call(this, value);
        }
    });
}
