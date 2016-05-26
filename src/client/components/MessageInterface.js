/**
 * MessageInterface.js
 * Client side
 */
'use strict';

var Messages = require('../../common/Messages.js');

module.exports = {
    init: function () {
        for (var m in Messages) {
            this.registerField(m, Messages[m]);
        }
        // General purpose messages short messages for game functions
        this.events.on('msg', deserializeMessages.bind(this));
        // Infrequent, potentially lengthy messages for things like code exchange and maybe chat
        this.events.on('json', handleJsonMessage.bind(this));
    },

    boot: function () {
        this.game.plugins.add(msgPlugin, this);
    },

    addMessageHandler: function (type, handler) {
        this.events.on('msg:' + type, handler.bind(this));
    },

    sendMessage: function (type, content) {
        this.msgQueue.push({msg: type, data: content});
    },

    serializeMessages: function () {
        this.msgBufOut.addUInt16(this.msgQueue.length);
        for (var i = 0; i < this.msgQueue.length; i++) {
            this.msgBufOut.addFieldValue(this.msgQueue[i].msg, this.msgQueue[i].data);
        }
    }

};

var deserializeMessages = function () {
    var n = this.msgBufIn.readUInt16();
    for (var i = 0; i < n; i++) {
        var msg = {};
        this.msgBufIn.readFieldValue(msg);
        var type = Object.keys(msg)[0];
        this.events.emit('msg:' + type, msg[type]);
    }
};

var handleMessages = function (msgs) {
    // TODO: work with buffer
    for (var i = 0; i < msgs.length; i++) {
        this.events.emit('msg:' + msgs[i].t, msgs[i].c);
    }
};

var handleJsonMessage = function (json) {

};

var msgPlugin = {
    init: function (starcoder) {
        this.starcoder = starcoder;
    },

    postUpdate: function () {
        if (this.starcoder.msgQueue.length) {
            this.starcoder.msgBufOut.reset();
            this.starcoder.serializeMessages();
            this.starcoder.socket.emit('message', this.starcoder.msgBufOut.export());
            this.starcoder.msgQueue.length = 0;
        }
    }
};