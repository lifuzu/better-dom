var hooks = {},
    $Element = require("./element");

hooks.relatedTarget = function(e) { return $Element(e.relatedTarget) };

module.exports = hooks;
