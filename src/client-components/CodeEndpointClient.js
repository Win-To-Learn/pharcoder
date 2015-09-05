/**
 * CodeEndpointClient.js
 *
 * Methods for sending code to server and dealing with code related responses
 */
'use strict';

module.exports = {
    onConnectCB: function (socket) {
        var self = this;
        socket.on('code status', function (status) {
            console.log('STATUS', status);
        });
        socket.on('code syntax error', function (error) {
            console.log('SYNTAX', error);
        });
        socket.on('code runtime error', function (error) {
            console.log('RUNTIME', error);
        });
    },

    sendCode: function (code) {
        this.socket.emit('code', code);
    }
};