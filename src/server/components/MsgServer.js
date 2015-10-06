/**
 * MsgServer.js
 *
 * Mixin for game state messages
 */
' use strict';

module.exports = {
    /**
     * Send generic message to given player
     *
     * @param player {Player}
     * @param msg {string} - message name
     * @param details {object} - data for message
     */
    send: function (player, msg, details) {
        player.socket.emit('msg ' + msg, details);
    }
};