var _ = require("./utils"),
    $Element = require("./element");

function makeClassesMethod(nativeStrategyName) {
    var methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class",
        strategy = function(className) { return this._node.classList[nativeStrategyName](className) },
        processClasses = function(el) { _.forEach(this, strategy, el) }; /* this = arguments */

    if (methodName === "hasClass") {
        return function() { if (this._node) return _.every(arguments, strategy, this) };
    } else {
        return function() { return _.forEach(this, processClasses, arguments) };
    }
}

/**
 * Check if element contains class name(s)
 * @param  {...String} classNames class name(s)
 * @return {Boolean}   true if the element contains all classes
 * @function
 */
$Element.prototype.hasClass = makeClassesMethod("contains");

/**
 * Add class(es) to element
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.addClass = makeClassesMethod("add");

/**
 * Remove class(es) from element
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.removeClass = makeClassesMethod("remove");

/**
 * Toggle class(es) on element
 * @param  {...String}  classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.toggleClass = makeClassesMethod("toggle");
