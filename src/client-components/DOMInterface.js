/**
 * DOMInterface.js
 *
 * Handle DOM configuration/interaction, i.e. non-Phaser stuff
 */
'use strict';

var DOMInterface = function () {};

DOMInterface.prototype.initDOMInterface = function () {
    var self = this;
    this.dom = {};              // namespace
    this.dom.codeButton = document.getElementById('code-btn');
    this.dom.codePopup = document.getElementById('code-popup');
    this.dom.codeSend = document.getElementById('code-send');
    this.dom.codeText = document.getElementById('code-text');

    this.toggle(this.dom.codePopup, false);

    this.dom.codeText.addEventListener('focus', function () {
        self.game.input.enabled = false;
    });

    this.dom.codeText.addEventListener('blur', function () {
        self.game.input.enabled = true;
    });

    this.dom.codeButton.addEventListener('click', function () {
        self.toggle(self.dom.codePopup);
    });

    this.dom.codeSend.addEventListener('click', function () {
        self.sendCode(self.dom.codeText.value);
    })
};

/**
 * Set/toggle visibility of element
 *
 * @param el {object} - element to set
 * @param state {?boolean} - show (true), hide (false), toggle (undefined)
 */
DOMInterface.prototype.toggle = function (el, state) {
    var display = el.style.display;
    if (!el.origDisplay) {
        if (display !== 'none') {
            el.origDisplay = display;
        } else {
            el.origDisplay = 'block';
        }
    }
    if (typeof state === 'undefined') {
        state = (display === 'none');
    }
    if (state) {
        el.style.display = el.origDisplay;
    } else {
        el.style.display = 'none';
    }
}

module.exports = DOMInterface;
