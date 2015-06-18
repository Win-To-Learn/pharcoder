/**
 * Asteroid.js
 *
 * Server side implementation
 */
'use string';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

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

Asteroid.prototype.clientType = 'Asteroid';
Asteroid.prototype.serverType = 'Asteroid';

Asteroid.prototype.lineColor = '#ff00ff';
Asteroid.prototype.fillColor = '#00ff00';
Asteroid.prototype.shapeClosed = true;
Asteroid.prototype.lineWidth = 1;
Asteroid.prototype.fillAlpha = 0.25;
Asteroid.prototype.shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];

Asteroid.prototype.updateProperties = ['fillColor', 'lineColor', 'fillAlpha', 'shapeClosed', 'shape', 'lineWidth',
    'vectorScale', 'state'];

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
        var crystal = this.world.addSyncableBody(Crystal, {});
        crystal.position[0] = this.position[0];
        crystal.position[1] = this.position[1];
        this.world.removeSyncableBody(this);
    }
}

module.exports = Asteroid;
