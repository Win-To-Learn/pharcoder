/**
 * MessageInterface.js
 */
'use strict';

module.exports = {
    init: function () {

    },

    sendMessage: function (player, type, content) {
        player.msgQueue.push({t: type, c: content});
    }
};