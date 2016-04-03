/**
 * Ship.js
 *
 * Client side implementation
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
//var Engine = require('./Engine.js');
//var Weapons = require('./Weapons.js');

var Ship = function (game, config) {
    VectorSprite.call(this, game, config);
    //this.setPosAngle(config.x, config.y, config.a);

    if (config.mass) {
        this.body.mass = config.mass;
    }
    //this.engine = Engine.add(game, 'thrust', 500);
    //this.addChild(this.engine);
    //this.weapons = Weapons.add(game, 'bullet', 12);
    //this.weapons.ship = this;
    //this.addChild(this.weapons);
    this.tagText = game.add.text(0, this.texture.height/2 + 1,
        this.tag, {font: 'bold 18px Arial', fill: this.lineColor || '#ffffff', align: 'center'});
    this.tagText.anchor.setTo(0.5, 0);
    this.addChild(this.tagText);
    this.localState = {
        thrust: 'off'
    };
    this._thrustState = 0;
    this.game.hud.setLaserColor(this.lineColor);
};

Ship.add = function (game, options) {
    var s = new Ship(game, options);
    game.add.existing(s);
    return s;
};

Ship.prototype = Object.create(VectorSprite.prototype);
Ship.prototype.constructor = Ship;

Starcoder.mixinPrototype(Ship.prototype, SyncBodyInterface.prototype);

Ship.prototype.mapFactor = 3;

Ship.prototype.updateTextures = function () {
    // FIXME: Probably need to refactor constructor a bit to make this cleaner
    VectorSprite.prototype.updateTextures.call(this);
    if (this.tagText) {
        //this.tagText.setStyle({fill: this.lineColor});
        this.tagText.fill = this.lineColor;
        this.tagText.y = this.texture.height/2 + 1;
    }
};

Ship.prototype.update = function () {
    VectorSprite.prototype.update.call(this);
    // FIXME: Need to deal with player versus foreign ships
    //switch (this.localState.thrust) {
    //    case 'starting':
    //        this.game.sounds.playerthrust.play();
    //        this.game.thrustgenerator.startOn(this);
    //        this.localState.thrust = 'on';
    //        break;
    //    case 'shutdown':
    //        this.game.sounds.playerthrust.stop();
    //        this.game.thrustgenerator.stopOn(this);
    //        this.localState.thrust = 'off';
    //}
    // Player ship only
    if (this.game.playerShip === this) {
        //this.game.inventorytext.setText(this.crystals.toString());
        this.game.hud.setCrystals(this.crystals);
        this.game.hud.setCharge(this.charge);
        this.game.hud.setTrees(this.trees);
    }
};

Object.defineProperty(Ship.prototype, 'tag', {
    get: function () {
        return this._tag;
    },
    set: function (val) {
        this._tag = val;
        this._dirty = true;
    }
});

Object.defineProperty(Ship.prototype, 'thrustState', {
    get: function () {
        return this._thrustState;
    },
    set: function (val) {
        if (val !== this._thrustState) {
            this._thrustState = val;
            // Maybe eventually do something fancier with directions, but for now it's just binary
            if (val === 0) {
                this.game.thrustgenerator.stopOn(this);
                if (this.game.playerShip === this) {
                    this.game.sounds.playerthrust.stop();
                }
            } else if (val === 1) {
                this.game.thrustgenerator.startOn(this);
                if (this.game.playerShip === this) {
                    this.game.sounds.playerthrust.play();
                }

            }
        }
    }
});

module.exports = Ship;
//Starcoder.Ship = Ship;
