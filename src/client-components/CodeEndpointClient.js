/**
 * CodeEndpointClient.js
 *
 * Methods for sending code to server and dealing with code related responses
 */

var CodeEndpointClient = function () {};

CodeEndpointClient.prototype.sendCode = function (code) {
    this.socket.emit('code', code);
};

module.exports = CodeEndpointClient;