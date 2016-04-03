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
        player.msgQueue.push({msg: type, data: content});
    },

    serializeMessages: function (messages) {
        this.msgBufOut.addUInt16(messages.length);
        for (var i = 0; i < messages.length; i++) {
            this.msgBufOut.addFieldValue(messages[i].msg, messages[i].data);
        }
    }
};