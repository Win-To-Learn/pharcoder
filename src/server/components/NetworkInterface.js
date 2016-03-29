/**
 * NetworkInterface.js
 */
'use strict';
var flag = true;
module.exports = {
    init: function () {
        var self = this;
        this.events.on('netTick', function () {
            self.events.emit('sync');
            //console.log('netTick');
            for (var i = self.playerList.length - 1; i >= 0; i--) {
                var player = self.playerList[i];
                player.socket.emit('update', {wu: player.worldUpdate, msg: player.msgQueue.slice()});
                player.msgQueue.length = 0;
            }
        });
    }
};