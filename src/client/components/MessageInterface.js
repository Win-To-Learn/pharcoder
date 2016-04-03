/**
 * MessageInterface.sj
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

    addMessageHandler: function (type, handler) {
        this.events.on('msg:' + type, handler.bind(this));
    }
};

var deserializeMessages = function () {
    var n = this.msgBufIn.readUInt16();
    for (var i = 0; i < n; i++) {
        var msg = {};
        this.msgBufIn.readFieldValue(msg);
        var type = Object.keys(msg)[0];
        console.log('Message', type, msg[type]);
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