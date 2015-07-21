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
    //this.dom.codeSend = document.getElementById('code-send');
    //this.dom.blocklyWorkspace = document.getElementById('blockly-workspace');
    //this.dom.codeText = document.getElementById('code-text');

    //this.dom.codeText.addEventListener('focus', function () {
    //    self.game.input.enabled = false;
    //});
    //
    //this.dom.codeText.addEventListener('blur', function () {
    //    self.game.input.enabled = true;
    //});

    this.dom.codeButton.addEventListener('click', function () {
        self.toggle(self.dom.codePopup);
        //Blockly.fireUiEvent(self.dom.blocklyWorkspace, 'resize');
    });

    window.addEventListener('message', function (event) {
        if (event.source === self.dom.codePopup.contentWindow) {
            self.sendCode(event.data);
        }
    });

    //this.dom.codeSend.addEventListener('click', function () {
    //    //self.sendCode(self.dom.codeText.value);
    //    console.log(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
    //    self.sendCode(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
    //});
    //
    //// Initialize blockly
    //this.blocklyWorkspace = Blockly.inject('blockly-workspace',
    //    {toolbox: document.getElementById('toolbox')});
    //console.log('bd', this.blocklyWorkspace);

    this.toggle(this.dom.codePopup, false);

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
