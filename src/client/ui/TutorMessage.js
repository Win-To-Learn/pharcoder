/**
 * TutorMessage.js
 */
'use strict';

var TutorMessage = function (game, x, y) {
    Phaser.Group.call(this, game, x, y);
    this.message = game.starcoder.makeFlexText(0, 0, '', {font: '24px Arial', fill: '#ff99ff', align: 'center'});
    this.message.anchor.setTo(0.5, 0.5);
};

TutorMessage.prototype = Phaser.Group;
TutorMessage.prototype.constructor = TutorMessage;

TutorMessage.prototype.setMessage = function (msg) {
    this.message.setText(msg);
};

module.exports = TutorMessage;