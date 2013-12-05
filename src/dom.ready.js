var _ = require("./utils"),
    DOM = require("./dom"),
    readyCallbacks = [],
    readyState = document.readyState,
    pageLoaded = function() {
        // safely trigger callbacks
        _.forEach(readyCallbacks, setTimeout);
        // cleanup
        readyCallbacks = null;
    };

document.addEventListener("DOMContentLoaded", pageLoaded, false);
window.addEventListener("load", pageLoaded, false);

// Catch cases where ready is called after the browser event has already occurred.
// IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if (document.attachEvent ? readyState === "complete" : readyState !== "loading") {
    pageLoaded();
}

/**
 * Asynchronously execute callback when DOM is ready
 * @memberOf DOM
 * @param {Function} callback event listener
 */
DOM.ready = function(callback) {
    if (typeof callback !== "function") throw _.makeError("ready", this);

    if (readyCallbacks) {
        readyCallbacks.push(callback);
    } else {
        setTimeout(callback, 0);
    }
};
