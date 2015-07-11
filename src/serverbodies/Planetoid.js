/**
 * Planetoid.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../common/Paths.js');
var UpdateProperties = require('../common/UpdateProperties.js').Planetoid;

var Planetoid = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0;
    this.angularDamping = 0;
};

Planetoid.prototype = Object.create(SyncBodyBase.prototype);
Planetoid.prototype.constructor = Planetoid;

Starcoder.mixinPrototype(Planetoid.prototype, UpdateProperties.prototype);

Planetoid.prototype.clientType = 'Planetoid';
Planetoid.prototype.serverType = 'Planetoid';

Planetoid.prototype._lineColor = '#0000ff';
Planetoid.prototype._fillColor = '#ff0000';
Planetoid.prototype._lineWidth = 1;
Planetoid.prototype._fillAlpha = 0.15;
Planetoid.prototype._shape = Paths.octagon;

module.exports = Planetoid;
