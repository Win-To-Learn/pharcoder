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

    login: function (socket, player) {
        var self = this;
        socket.on('message', function (data) {
            self.msgBufIn.reset(new Buffer (data));
            self.deserializeMessages(player);
        });
    },

    sendMessage: function (player, type, content) {
        player.msgQueue.push({msg: type, data: content});
    },

    deserializeMessages: function (player) {
        var n = this.msgBufIn.readUInt16();
        for (var i = 0; i < n; i++) {
            var msg = {};
            this.msgBufIn.readFieldValue(msg);
            var type = Object.keys(msg)[0];
            this.events.emit('msg:' + type, player, msg[type]);
        }
    },

    serializeMessages: function (messages) {
        this.msgBufOut.addUInt16(messages.length);
        for (var i = 0; i < messages.length; i++) {
            this.msgBufOut.addFieldValue(messages[i].msg, messages[i].data);
        }
    }
};