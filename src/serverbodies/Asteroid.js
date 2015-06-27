/**
 * Asteroid.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../common/Paths.js');
var UpdateProperties = require('../common/UpdateProperties.js').Asteroid;

var Crystal = require('./Crystal.js');

//var Starcoder = require('../../Starcoder-server.js');

//var shared = require('../shared/Asteroid.js');

var Asteroid = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0;
    this.angularDamping = 0;
};

Asteroid.prototype = Object.create(SyncBodyBase.prototype);
Asteroid.prototype.constructor = Asteroid;

Starcoder.mixinPrototype(Asteroid.prototype, UpdateProperties.prototype);

Asteroid.prototype.clientType = 'Asteroid';
Asteroid.prototype.serverType = 'Asteroid';

//Asteroid.prototype.lineColor = '#ff00ff';
//Asteroid.prototype.fillColor = '#00ff00';
//Asteroid.prototype.shapeClosed = true;
//Asteroid.prototype.lineWidth = 1;
//Asteroid.prototype.fillAlpha = 0.25;
Asteroid.prototype.shape = Paths.octagon;

//Asteroid.prototype.updateProperties = ['vectorScale', 'state'];

//Asteroid.prototype.getPropertyUpdate = function (propname, properties) {
//    switch (propname) {
//        default:
//            SyncBodyBase.prototype.getPropertyUpdate.call(this, propname, properties);
//    }
//};

Asteroid.prototype.update = function () {
    if (this.state === 'exploding') {
        // FIXME: (maybe) timing, effects, etc.
        this.state = 'exploded';
    } else if (this.state === 'exploded') {
        var crystal = this.world.addSyncableBody(Crystal, {mass: 10});
        crystal.position[0] = this.position[0];
        crystal.position[1] = this.position[1];
        this.world.removeSyncableBody(this);
    }
}

module.exports = Asteroid;
