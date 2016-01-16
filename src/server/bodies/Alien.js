/**
 * Alien.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../../common/Paths.js');
var UpdateProperties = require('../../common/UpdateProperties.js').Alien;

//var Starcoder = require('../../Starcoder-server.js');

//var shared = require('../shared/Alien.js');

var Alien = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0;
    this.angularDamping = 0;
};

Alien.prototype = Object.create(SyncBodyBase.prototype);
Alien.prototype.constructor = Alien;

Starcoder.mixinPrototype(Alien.prototype, UpdateProperties.prototype);

Alien.prototype.clientType = 'Alien';
Alien.prototype.serverType = 'Alien';

//Alien.prototype.lineColor = '#ff00ff';
//Alien.prototype.fillColor = '#00ff00';
//Alien.prototype.shapeClosed = true;
//Alien.prototype.lineWidth = 1;
//Alien.prototype.fillAlpha = 0.25;
Alien.prototype._shape = Paths.octagon;

Alien.prototype.deadly = true;

//Alien.prototype.updateProperties = ['vectorScale', 'state'];

//Alien.prototype.getPropertyUpdate = function (propname, properties) {
//    switch (propname) {
//        default:
//            SyncBodyBase.prototype.getPropertyUpdate.call(this, propname, properties);
//    }
//};

module.exports = Alien;
