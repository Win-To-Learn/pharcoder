/**
 * CollisionHandlers.js
 */
'use strict';

var p2 = require('p2');

module.exports = {
    init: function () {
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
                //} else if (A.serverType === 'Bullet' && B.serverType === 'Tree') {
                //    BulletTree.bind(self)(A, B);
                } else if (A.serverType === 'Ship' && B.serverType === 'Crystal') {
                    ShipCrystal.bind(self)(A, B);
                } else if (A.serverType === 'Ship' && B.serverType === 'Planetoid') {
                    ShipPlanetoid.bind(self)(A, B, equations);
                } else if (A.serverType === 'Ship' && B.deadly) {
                    ShipDeadly.bind(self)(A, B);
                } else if (A.serverType === 'TractorBeam' && B.tractorable) {
                    TractorBeamTractorable.bind(self)(A, B);
                } else if (A.serverType === 'Asteroid' && B.serverType === 'Tree') {
                    AsteroidTree.call(self, A, B);
                } else if (A.serverType === 'Ship' && B.serverType === 'Tree') {
                    ShipTree.call(this, A, B);
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
    }
};

// Handlers
function BulletAsteroid (bullet, asteroid) {
    this.send(bullet.firer.player, 'asteroid pop', asteroid.vectorScale);
    asteroid.explode(true);
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
        this.send(ship.player, 'plant tree');
        planetoid.plantTree(point[0], point[1], ship);
        ship.player.stats.treesPlanted++;
        this.updatePlayerScore('Trees Planted', ship.player.id, ship.player.stats.treesPlanted);
    }
}

function ShipDeadly (ship, obstacle) {
    if (!ship.dead) {
        ship.knockOut();
    }
}

function BulletShip (bullet, ship) {
    if (bullet.firer !== ship) {
        this.send(ship.player, 'tagged');
        ship.setTimer(2, {props: {lineColor: ship.lineColor}});
        ship.lineColor = bullet.firer.lineColor;
        bullet.firer.player.stats.tags++;
        this.updatePlayerScore('Ships Tagged', bullet.firer.player.id, bullet.firer.player.stats.tags);
        bullet.firer.player.stats.currentTagStreak++;
        if (bullet.firer.player.stats.currentTagStreak > bullet.firer.player.stats.bestTagStreak) {
            bullet.firer.player.stats.bestTagStreak = bullet.firer.player.stats.currentTagStreak;
            this.updatePlayerScore('Tag Streak', bullet.firer.player.id, bullet.firer.player.stats.bestTagStreak);
        }
        ship.player.stats.currentTagStreak = 0;
        this.world.removeSyncableBody(bullet);
    }
}

//function BulletTree (bullet, tree) {
//    tree.lineColor = bullet.firer.lineColor;
//    this.world.removeSyncableBody(bullet);
//}

function TractorBeamTractorable (beam, target) {
    if (beam.canAttach(target)) {
        beam.attachTarget(target);
        //beam.velocity[0] = 0;
        //beam.velocity[1] = 1;
        //beam.mode = 'tractoring';
        //beam.beamConstraint = new p2.DistanceConstraint(beam.beamParent, beam);
        //beam.world.addConstraint(beam.beamConstraint);
        //beam.tractorConstraint = new p2.DistanceConstraint(beam, planet);
        //beam.world.addConstraint(beam.tractorConstraint);
        //planet.mass = 10;
        //planet.damping = 0.99;
        //planet.updateMassProperties();
    }
}

function AsteroidTree (asteroid, tree) {
    this.world.removeConstraint(tree.attachmentConstraint);
    this.world.removeSyncableBody(tree);
}

function ShipTree (ship, tree) {
    if (ship.owner !== ship.player) {
        tree.owner = ship.player;
        tree.lineColor = ship.lineColor;
    }
}