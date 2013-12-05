// NoScope fix
var innerHTML = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");

Object.defineProperty(Element.prototype, "innerHTML", {
    set: function(htmlContent) {
        innerHTML.set.call(this, "<br>" + htmlContent);
        this.removeChild(this.firstChild);
    }
});
