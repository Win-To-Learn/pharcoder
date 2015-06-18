/**
 * Ship.js
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');

var VectorSprite = require('./VectorSprite.js');
var Engine = require('./Engine.js');
var Weapons = require('./Weapons.js');

var Ship = function (game, options) {
    VectorSprite.call(this, game, options);

    if (options.mass) {
        this.body.mass = options.mass;
    }
    this.engine = Engine.add(game, 'thrust', 500);
    this.addChild(this.engine);
    this.weapons = Weapons.add(game, 'bullet', 12);
    this.weapons.ship = this;
    //this.addChild(this.weapons);
    this.tagText = game.add.text(0, this.graphics.height/2 + 1,
        options.tag, {font: 'bold 18px Arial', fill: this.color || '#ffffff', align: 'center'});
    this.tagText.anchor.setTo(0.5, 0);
    this.addChild(this.tagText);
    this.setChildIndex(this.engine, 0);
};

Ship.add = function (game, options) {
    var s = new Ship(game, options);
    game.add.existing(s);
    return s;
};

Ship.prototype = Object.create(VectorSprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.setLineStyle = function (color, lineWidth) {
    Starcoder.VectorSprite.prototype.setLineStyle.call(this, color, lineWidth);
    this.tagText.setStyle({fill: color});
};

//Ship.prototype.shape = [
//    [-1,-1],
//    [-0.5,0],
//    [-1,1],
//    [0,0.5],
//    [1,1],
//    [0.5,0],
//    [1,-1],
//    [0,-0.5],
//    [-1,-1]
//];
Ship.prototype.lineWidth = 6;

Ship.prototype.update = function () {
    this.engine.update();
};

module.exports = Ship;
//Starcoder.Ship = Ship;
