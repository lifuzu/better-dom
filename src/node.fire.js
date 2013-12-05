var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    hooks = require("./node.on.hooks");

/**
 * Triggers an event of specific type with optional extra arguments
 * @param  {String}    type   type of event
 * @param  {...Object} [args] extra arguments to pass into each event handler
 * @return {Boolean} true if default action wasn't prevented
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.fire = function(type) {
    if (typeof type !== "string") throw _.makeError("fire", this);

    var args = _.slice(arguments, 1);

    return _.every(this, function(el) {
        var node = el._node,
            hook = hooks[type],
            handler = {},
            e = document.createEvent("HTMLEvents"),
            canContinue;

        if (hook) hook(handler);

        e.initEvent(handler._type || type, true, true);
        e._args = args;

        canContinue = node.dispatchEvent(e);

        // Call native method. IE<9 dies on focus/blur to hidden element
        if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
            // Prevent re-triggering of the same event
            EventHandler.skip = type;

            node[type]();

            EventHandler.skip = null;
        }

        return canContinue;
    });
};
