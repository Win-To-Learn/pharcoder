/**
 * NetworkInterface.js
 */
'use strict';

module.exports = {
    init: function () {
        var self = this;
        this.events.on('syncTick', function () {
            for (var i = self.playerList.length - 1; i >= 0; i--) {
                var player = self.playerlist[i];
                if (player.msgQueue.length) {
                    player.socket.emit('update', player.msgQueue.slice());
                    player.msgQueue.length = 0;
                }
            }
        });
    }
};