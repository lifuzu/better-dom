// Extend Event.prototype with a few of the W3C standard APIs on Event
if (!Element.prototype.addEventListener) {
    var docEl = document.documentElement,
        buttonGetter = Object.getOwnPropertyDescriptor(Event.prototype, "button").get;

    Object.defineProperty(Event.prototype, "target", {
        get: function() {
            return this.srcElement;
        }
    });
    Object.defineProperty(Event.prototype, "relatedTarget", {
        get: function() {
            return this[(this.toElement === this.currentTarget ? "from" : "to") + "Element"];
        }
    });
    Object.defineProperty(Event.prototype, "defaultPrevented", {
        get: function() {
            return this.returnValue === false;
        }
    });
    Object.defineProperty(Event.prototype, "which", {
        get: function() {
            return this.keyCode;
        }
    });
    Object.defineProperty(Event.prototype, "button", {
        get: function() {
            var button = buttonGetter.call(this);
            // click: 1 === left; 2 === middle; 3 === right
            return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
        }
    });
    Object.defineProperty(Event.prototype, "pageX", {
        get: function() {
            return this.clientX + docEl.scrollLeft - docEl.clientLeft;
        }
    });
    Object.defineProperty(Event.prototype, "pageY", {
        get: function() {
            return this.clientY + docEl.scrollTop - docEl.clientTop;
        }
    });
    Event.prototype.stopPropagation = function () {
        this.cancelBubble = true;
    };
    Event.prototype.preventDefault = function () {
        this.returnValue = false;
    };
}
