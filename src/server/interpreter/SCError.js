/**
 * SCError.js
 */
'use strict';

var SCError = function (msg) {
    this.name = 'StarCoder Error';
    this.message = msg;
};

SCError.prototype = Object.create(Error.prototype);
SCError.prototype.constructor = SCError;

module.exports = SCError;
