/**
 * NetworkInterface.js
 * Server side
 */
'use strict';

module.exports = {
    finalize: function () {
        this.msgBufOut = this.newMsgBuffer(this.config.netBufferSize);
        this.msgBufIn = this.newMsgBuffer();
        //this.events.on('netTick', function () {
        //    self.events.emit('sync');
        //    //console.log('netTick');
        //    for (var i = self.playerList.length - 1; i >= 0; i--) {
        //        var player = self.playerList[i];
        //        player.socket.emit('update', {wu: player.worldUpdate, msg: player.msgQueue.slice()});
        //        player.msgQueue.length = 0;
        //    }
        //});
    },

    sendPlayerUpdate: function (player, worldUpdate) {
        player.socket.emit('update', {wu: worldUpdate, msg: player.msgQueue.slice()});
        player.msgQueue.length = 0;
    },

    doPlayerUpdate: function (player) {
        this.serializeMessages(player.msgQueue);
        player.msgQueue.length = 0;
        player.socket.emit('message', this.msgBufOut.export());
    }
};

//var serializeMessages = function (messages, msgbuf) {
//    msgbuf.addUInt16(messages.length);
//    for (var i = 0; i < messages.length; i++) {
//        msgbuf.addFieldValue(messages[i].msg, messages[i].data);
//    }
//};