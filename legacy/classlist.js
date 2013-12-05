// classList property polyfill
var rclass = /[\n\t\r]/g;

Object.defineProperty(Element.prototype, "classList", {
    get: function() {
        var node = this;

        return {
            contains: function(className) {
                return (" " + node.className + " ").replace(rclass, " ").indexOf(" " + className + " ") >= 0;
            },
            add: function(className) {
                if (!this.contains(className)) node.className += " " + className;
            },
            remove: function(className) {
                className = (" " + node.className + " ").replace(rclass, " ").replace(" " + className + " ", " ");

                node.className = className.trim();
            },
            toggle: function(className) {
                var oldClassName = node.className;

                this.add(className);

                if (oldClassName === node.className) this.remove(className);
            }
        };
    }
});
