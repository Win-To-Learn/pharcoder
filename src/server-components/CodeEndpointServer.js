/**
 * CodeEndpointServer.js
 *
 * Receive requests to run code, authorize and stage execution, return results
 */

var CodeEndpointServer = function () {};

CodeEndpointServer.prototype.initCodeEndpointServer = function () {
    this.clientReadyFunctions.push(this.attachHandler.bind(this));
};

CodeEndpointServer.prototype.attachHandler = function (player) {
    var self = this;
    player.socket.on('code', function (code) {
        //console.log('pretending to eval', code);
        eval(code);
    });
};

module.exports = CodeEndpointServer;