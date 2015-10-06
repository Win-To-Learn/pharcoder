/**
 * HUD.js
 *
 * Display for inventory and status
 */
'use strict';

var Paths = require('../../common/Paths.js');
var Bullet = require('../bodies/Bullet.js');

var HUD = function (game, x, y, width, height) {
    Phaser.Graphics.call(this, game, x, y);
    this.layout(width, height);
};

HUD.prototype = Phaser.Graphics.prototype;
HUD.prototype.constructor = HUD;

HUD.prototype.layout = function (width, height) {
    var xunit = Math.floor(width / 18);
    var yunit = Math.floor(height / 8);
    // Outline
    this.lineStyle(2, 0xcccccc, 1.0);
    // Crossline
    this.moveTo(0, 4 * yunit);
    this.lineTo(width, 4 * yunit);
    this.drawRect(0, 0, width, height);
    // Code Area
    this.codetext = this.game.starcoder.makeFlexText(xunit * 9, yunit * 2, 'CODE',
        {font: '24px Arial', fill: '#ff9900', align: 'center'});
    this.codetext.anchor.setTo(0.5, 0.5);
    this.codetext.inputEnabled = true;
    this.codetext.events.onInputDown.add(this.game.starcoder.toggleCodeWindow, this.game.starcoder);
    this.addChild(this.codetext);
    // Inventory area
    // Crystal icon
    this.lineStyle(1, 0x00ffff, 1.0);
    this.drawPolygon(Paths.normalize(Paths.octagon, 5, xunit * 2, yunit * 5, true));
    this.drawPolygon(Paths.normalize(Paths.d2cross, 5, xunit * 2, yunit * 5, true));
    // Amount
    //this.crystaltext = this.game.make.text(xunit * 6, yunit * 5.25, '0',
    //    {font: '26px Arial', fill: '#00ffff', align: 'center'});
    this.crystaltext = this.game.starcoder.makeFlexText(xunit * 6, yunit * 5.25, '0',
        this.game.starcoder.config.fonts.hudCode);
    this.crystaltext.anchor.setTo(0.5, 0.5);
    this.addChild(this.crystaltext);
    // Tree icon
    this.lineStyle(1, 0x00ff00, 1.0);
    for (var i = 0, l = treeIconPaths.length; i < l; i++) {
        this.drawPolygon(Paths.normalize(treeIconPaths[i], 5, xunit * 11, yunit * 5, false));
    }
    // Amount
    this.treetext = this.game.make.text(xunit * 15, yunit * 5.25, '0',
        {font: '26px Arial', fill: '#00ff00', align: 'center'});
    this.treetext.anchor.setTo(0.5, 0.5);
    this.addChild(this.treetext);
    this.lasers = [];
    for (i = 0; i < 5; i++) {
        var laser = new Bullet(this.game, {nophysics: true, properties: {lineColor: '#ff0000'}});
        laser.x = xunit * 2 + i * 24;
        laser.y = yunit * 7;
        laser.anchor.setTo(0.5);
        laser.angle = 90;
        this.addChild(laser);
        this.lasers.push(laser);
    }

};

HUD.prototype.setLaserColor = function (color) {
    this.lasers[0].config({lineColor: color});
    this.lasers[0].updateTextures();
};

HUD.prototype.setCrystals = function (x) {
    this.crystaltext.setText(x.toString());
};


HUD.prototype.setTrees = function (x) {
    this.treetext.setText(x.toString());
};

HUD.prototype.setCharge = function (x) {
    for (var i = 0, l = this.lasers.length; i < l; i++) {
        if (x > i) {
            this.lasers[i].visible = true;
        } else {
            this.lasers[i].visible = false;
        }
    }
};

var treeIconPaths = [
    [[0,2],[0,-2]],
    [[-2,-2],[0,1],[2,-2]],
    [[-1,-2],[0,-1],[1,-2]],
    [[-2,-1],[-1,-0.5],[-2,0]],
    [[2,-1],[1,-0.5],[2,0]]
];

module.exports = HUD;
