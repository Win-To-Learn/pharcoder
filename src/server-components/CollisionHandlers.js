/**
 * CollisionHandlers.js
 */
'use strict';

//var p2 = require('p2');

var CollisionHandlers = function () {};

CollisionHandlers.prototype.initCollisionHandlers = function () {
    var self = this;;
    this.world.on('beginContact', function (e) {
        var A = e.bodyA;
        var B = e.bodyB;
        var t = null;
        // Run tests twice - once each way
        while (true) {
            if (A.serverType === 'Bullet' && B.serverType === 'Asteroid') {
                BulletAsteroid.bind(self)(A, B);
            } else if (A.serverType === 'Ship' && B.serverType === 'Asteroid') {
                ShipAsteroid.bind(self)(A, B);
            } else if (A.serverType === 'Ship' && B.serverType === 'Crystal') {
                ShipCrystal.bind(self)(A, B);
            }
            // Swap A and B if we haven't already
            if (t) {
                break;
            } else {
                t = A;
                A = B;
                B = t;
            }
        }
    });
};

// Handlers
function BulletAsteroid (bullet, asteroid) {
    asteroid.state = 'exploding';
    this.world.removeSyncableBody(bullet);
}

function ShipAsteroid (ship, asteroid) {
    console.log('Ship Asteroid');
}

function ShipCrystal (ship, crystal) {
    // TODO: Variable crystal values?
    if (crystal.state !== 'picked up') {
        crystal.state = 'picked up';
        ship.crystals += 50;
        this.send(ship.player, 'crystal pickup', 50);
    }
}

module.exports = CollisionHandlers;