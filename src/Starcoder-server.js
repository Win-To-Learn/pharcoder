/**
 * Starcoder-server.js
 *
 * Starcoder master object extended with server only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');

Starcoder.prototype.role = 'server';

// FIXME: Extend object

module.exports = Starcoder;
