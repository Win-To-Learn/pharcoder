/**
 * StationBlock.js
 *
 * Server side
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = require('./SyncBodyBase.js');

var StationBlock = function (config) {
    SyncBodyBase.call(this, config);
};

StationBlock.prototype = Object.create(SyncBodyBase.prototype);
StationBlock.prototype.constructor = StationBlock;

module.exports = StationBlock;