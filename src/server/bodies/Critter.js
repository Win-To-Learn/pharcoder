/**
 * Critter.js
 *
 * Server side implementation
 */
'use strict';

const fs = require('fs');
var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

const numCritters = 6;

var Critter = function (starcoder, config) {
    let realGenome;
    // Santize genome
    if (config.genome) {
        realGenome = [];
        for (let i = 0; i < 3; i++) {
            if (typeof config.genome[i] === 'string') {
                let t = Critter.geneMap[config.genome[i]];
                if (t) {
                    realGenome.push(t);
                } else {
                    realGenome.push(Math.floor(Math.random() * Critter.numCritters));
                }
            } else if (typeof config.genome[i] === 'number') {
                realGenome.push(Math.floor(config.genome[i]) % Critter.numCritters);
            } else {
                realGenome.push(Math.floor(Math.random() * Critter.numCritters));
            }
        }
        config.genome = realGenome;
    } else {
        realGenome = [Math.floor(Math.random() * Critter.numCritters), Math.floor(Math.random() * Critter.numCritters),
            Math.floor(Math.random() * Critter.numCritters)];
    }
    config.genome = realGenome;
    SyncBodyBase.call(this, starcoder, config);
    //console.log('Critter create', this.id, config);
    //console.log(this.id, 'xy', this.position[0], this.position[1]);
};

// Using a static properties isn't ideal but it'll do
Critter.geneMap = {
    "bird": 0,
    "horse": 1,
    "monkey": 2,
    "penguin": 3,
    "rat": 4,
    "trex": 5
};
Critter.numCritters = Object.keys(Critter.geneMap).length;

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
