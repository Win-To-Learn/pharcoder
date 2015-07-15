/**
 * CollisionHandlers.js
 */
'use strict';

//var p2 = require('p2');

var CollisionHandlers = function () {};

CollisionHandlers.prototype.initCollisionHandlers = function () {
    var self = this;
    this.world.on('beginContact', function (e) {
        var A = e.bodyA;
        var B = e.bodyB;
        var equations = e.contactEquations;
        var t = null;
        // Run tests twice - once each way
        while (true) {
            if (A.serverType === 'Bullet' && B.serverType === 'Asteroid') {
                BulletAsteroid.bind(self)(A, B);
            } else if (A.serverType === 'Bullet' && B.serverType === 'Ship') {
                BulletShip.bind(self)(A, B);
            } else if (A.serverType === 'Bullet' && B.serverType === 'Tree') {
                BulletTree.bind(self)(A, B);
            } else if (A.serverType === 'Ship' && B.serverType === 'Crystal') {
                ShipCrystal.bind(self)(A, B);
            } else if (A.serverType === 'Ship' && B.serverType === 'Planetoid') {
                ShipPlanetoid.bind(self)(A, B, equations);
            } else if (A.serverType === 'Ship' && B.deadly) {
                ShipDeadly.bind(self)(A, B);
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

function ShipCrystal (ship, crystal) {
    // TODO: Variable crystal values?
    if (!crystal.pickedup) {
        crystal.pickedup = true;        // Flag to avoid double pickups
        ship.crystals += 50;
        this.send(ship.player, 'crystal pickup', 50);
        this.world.removeSyncableBody(crystal);
    }
}

function ShipPlanetoid (ship, planetoid, equations) {
    // First make sure this is first impact
    for (var i = 0, l = equations.length; i < l; i++) {
        if (!equations[i].firstImpact) {
            return;
        }
    }
    // Then make sure we have enough crystals
    if (ship.crystals >= 150) {
        ship.crystals -= 150;
        // Assume common case of single point contact
        equations = equations[0];
        if (equations.bodyA === planetoid) {
            var point = equations.contactPointA;
        }  else {
            point = equations.contactPointB;
        }
        planetoid.plantTree(point[0], point[1], ship);
    }
}

function ShipDeadly (ship, obstacle) {
    if (!ship.dead) {
        ship.knockOut();
    }
}

function BulletShip (bullet, ship) {
    if (bullet.firer !== ship) {
        ship.lineColor = bullet.firer.lineColor;
        this.world.removeSyncableBody(bullet);
    }
}

function BulletTree (bullet, tree) {
    tree.lineColor = bullet.firer.lineColor;
    this.world.removeSyncableBody(bullet);
}

module.exports = CollisionHandlers;