var _ = require("./utils"),
    $Element = require("./element"),
    features = require("./features");

/**
 * Set property/attribute value by name
 * @param {String}           [name]  property/attribute name
 * @param {String|Function}  value   property/attribute value or function that returns it
 * @return {$Element}
 * @see https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter
 */
$Element.prototype.set = function(name, value) {
    var len = arguments.length,
        originalName = name,
        originalValue = value,
        nameType = typeof name;

    return this.legacy(function(node, el, index) {
        name = originalName;
        value = originalValue;

        if (len === 1) {
            if (name == null) {
                value = "";
            } else if (nameType === "object") {
                return _.forOwn(name, function(value, name) { el.set(name, value) });
            } else {
                // handle numbers, booleans etc.
                value = nameType === "function" ? name : String(name);
            }

            if (node.tagName === "SELECT") {
                // selectbox has special case
                if (_.every(node.options, function(o) { return !(o.selected = o.value === value) })) {
                    node.selectedIndex = -1;
                }

                return;
            } else if (node.type && "value" in node) {
                // for IE use innerText because it doesn't trigger onpropertychange
                name = features.DOM2_EVENTS ? "value" : "innerText";
            } else {
                name = "innerHTML";
            }
        } else if (len > 2 || len === 0 || nameType !== "string") {
            throw _.makeError("set", el);
        }

        if (typeof value === "function") value = value(el, index);

        if (value == null) {
            node.removeAttribute(name);
        } else if (name in node) {
            node[name] = value;
        } else {
            node.setAttribute(name, value);
        }
    });
};
