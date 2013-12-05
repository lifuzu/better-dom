/*
 * Helper type to create an event handler
 */
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    debouncedEvents = "scroll mousemove",
    createDebouncedEventWrapper = function(originalHandler, debouncing) {
        return function(e) {
            if (!debouncing) {
                debouncing = true;

                _.requestAnimationFrame(function() {
                    originalHandler(e);

                    debouncing = false;
                });
            }
        };
    };

function EventHandler(type, selector, context, callback, props, currentTarget) {
    context = context || currentTarget;

    var matcher = SelectorMatcher(selector),
        handler = function(e) {
            if (EventHandler.skip === type) return; // early stop in case of default action;

            var target = e.target,
                root = currentTarget._node,
                fn = typeof callback === "string" ? context[callback] : callback,
                args = props || ["target", "defaultPrevented"];

            if (typeof fn !== "function") return; // early stop in case of late binding

            for (; matcher && !matcher(target); target = target.parentNode) {
                if (!target || target === root) return; // no matched element was found
            }

            args = _.map(args, function(name) {
                switch (name) {
                case "type":
                    return type;
                case "currentTarget":
                    return currentTarget;
                case "relatedTarget":
                    return $Element(e.relatedTarget);
                case "target":
                    return $Element(target);
                }

                return e[name];
            });

            // prepend extra arguments if they exist
            if (e._args && e._args.length) args = e._args.concat(args);

            // prevent default if handler returns false
            if (fn.apply(context, args) === false) e.preventDefault();
        };

    if (~debouncedEvents.indexOf(type)) handler = createDebouncedEventWrapper(handler);

    return handler;
}

module.exports = EventHandler;
