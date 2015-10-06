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
        socket.on('code saved', function (label) {
            self.addCodeLabel(label);
        });
        socket.on('code loaded', function (code) {
            //console.log('load code', code);
            self.setCodeForUI(code);
        });
        socket.on('code labels', function (labels) {
            for (var i = 0, l = labels.length; i < l; i++) {
                self.addCodeLabel(labels[i]);
            }
        });
    },

    sendCodeMessage: function (kind, data) {
        console.log('sending', kind, data);
        this.socket.emit('code ' + kind, data);
    }
};