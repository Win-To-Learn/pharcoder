/**
 * MessageInterface.js
 */
'use strict';

var Messages = require('../../common/Messages.js');

module.exports = {
    init: function () {
        for (var m in Messages) {
            this.registerField(m, Messages[m]);
        }
    },

    sendMessage: function (player, type, content) {
        player.msgQueue.push({t: type, c: content});
    }
};