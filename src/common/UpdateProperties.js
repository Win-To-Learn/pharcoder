/**
 * UpdateProperties.js
 *
 * Client/server syncable properties for game objects
 */
'use strict';

var Ship = function () {};
Ship.prototype.updateProperties = ['lineWidth', 'lineColor', 'fillColor', 'fillAlpha',
    'vectorScale', 'shape', 'shapeClosed', 'playerid', 'crystals', 'dead', 'tag', 'charge', 'trees', 'outline', 'offset'];

var Asteroid = function () {};
Asteroid.prototype.updateProperties = ['vectorScale', 'outline', 'offset'];

var Crystal = function () {};
Crystal.prototype.updateProperties = ['vectorScale', 'outline', 'offset'];

var GenericOrb = function () {};
GenericOrb.prototype.updateProperties = ['lineColor', 'vectorScale', 'outline', 'offset'];

var Planetoid = function () {};
Planetoid.prototype.updateProperties = ['lineColor', 'fillColor', 'lineWidth', 'fillAlpha', 'vectorScale', 'owner', 'outline', 'offset'];

var Tree = function () {};
Tree.prototype.updateProperties = ['vectorScale', 'lineColor', 'graph', 'step', 'depth', 'outline', 'offset'];

var Bullet = function () {};
Bullet.prototype.updateProperties = ['lineColor', 'outline', 'offset'];

var TractorBeam = function () {};
TractorBeam.prototype.updateProperties = ['offset'];

var StarTarget = function () {};
StarTarget.prototype.updateProperties = ['stars', 'lineColor', 'vectorScale', 'outline', 'offset'];


exports.Ship = Ship;
exports.Asteroid = Asteroid;
exports.Crystal = Crystal;
exports.GenericOrb = GenericOrb;
exports.Bullet = Bullet;
exports.Planetoid = Planetoid;
exports.Tree = Tree;
exports.TractorBeam = TractorBeam;
exports.StarTarget = StarTarget;
