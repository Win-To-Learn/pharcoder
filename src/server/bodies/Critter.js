/**
 * Critter.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Critter = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    //console.log('Critter create', this.id, config);
    this.genome = [Math.floor(Math.random()*3), Math.floor(Math.random()*3), Math.floor(Math.random()*3)];
    //console.log(this.id, 'xy', this.position[0], this.position[1]);
};

Critter.prototype = Object.create(SyncBodyBase.prototype);
Critter.prototype.constructor = Critter;

Critter.prototype.clientType = 'Critter';
Critter.prototype.serverType = 'Critter';


// Critter.prototype.beginContact = function (body) {
// };
//
// Critter.prototype.beginSense = function (body) {
// };
//
// Critter.prototype.endSense = function (body) {
// };

Object.defineProperty(Critter.prototype, 'genome', {
    get: function () {
        return this._genome;
    },
    set: function (val) {
        this._genome = val;
        this._dirtyProperties.genome = true;
    }
});

module.exports = Critter;
