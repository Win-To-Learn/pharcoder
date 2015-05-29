/**
 * Ship.js
 *
 * @type {Starcoder|exports}
 */
'use strict';

var Starcoder = require('../Starcoder.js');
require('./VectorSprite.js');
require('./ThrustParticle.js');

var Ship = function (game, x, y, tag) {
    Starcoder.VectorSprite.call(this, game, x, y);

    this.engine = Starcoder.ThrustParticle.Emitter.add(game, 'orange', 500);
    this.addChild(this.engine);
    this.tagText = game.add.text(0, this.graphics.height/2 + 1,
        tag, {font: 'bold 18px Arial', fill: this.color || '#ffffff', align: 'center'});
    this.tagText.anchor.setTo(0.5, 0);
    this.addChild(this.tagText);
    this.setChildIndex(this.engine, 0);
};

Ship.add = function (game, x, y, tag) {
    var s = new Ship(game, x, y, tag);
    game.add.existing(s);
    return s;
};

Ship.prototype = Object.create(Starcoder.VectorSprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.setLineStyle = function (color, lineWidth) {
    Starcoder.VectorSprite.prototype.setLineStyle.call(this, color, lineWidth);
    this.tagText.setStyle({fill: color});
};

Ship.prototype.shape = [
    [-1,-1],
    [-0.5,0],
    [-1,1],
    [0,0.5],
    [1,1],
    [0.5,0],
    [1,-1],
    [0,-0.5],
    [-1,-1]
];
Ship.prototype.lineWidth = 6;

Ship.prototype.update = function () {
    this.engine.update();
};

module.exports = Ship;
Starcoder.Ship = Ship;
