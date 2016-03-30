/**
 * MessageInterface.sj
 * Client side
 */
'use strict';

module.exports = {
    init: function () {
        // General purpose messages short messages for game functions
        this.events.on('msg', handleMessages.bind(this));
        // Infrequent, potentially lengthy messages for things like code exchange and maybe chat
        this.events.on('json', handleJsonMessage.bind(this));
    },

    addMessageHandler: function (type, handler) {
        this.events.on('msg:' + type, handler.bind(this));
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