var doc = document,
    win = window;

module.exports = {
    CSS3_ANIMATIONS: win.CSSKeyframesRule || !doc.attachEvent,
    DOM2_EVENTS: !!window.getComputedStyle
};
