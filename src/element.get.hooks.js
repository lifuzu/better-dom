var hooks = {};

hooks.type = function(node) {
    // some browsers don't recognize input[type=email] etc.
    return node.getAttribute("type") || node.type;
};

module.exports = hooks;
