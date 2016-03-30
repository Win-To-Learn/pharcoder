/**
 * MessageInterface.js
 */
'use strict';

var idToName = [];

var nameToId = {};

module.exports = {
    init: function () {

    },

    sendMessage: function (player, type, content) {
        player.msgQueue.push({t: type, c: content});
    },

    registerType: function (name) {
        var i = idToName.push(name) - 1;
        nameToId[name] = i;
        return i;
    }
};