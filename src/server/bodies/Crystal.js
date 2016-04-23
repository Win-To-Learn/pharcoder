/**
 * Crystal.js
 *
 * Server side implementation
 */
'use string';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../../common/Paths.js');

var Crystal = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    this.damping = 0;
    this.angularDamping = 0;
};

Crystal.prototype = Object.create(SyncBodyBase.prototype);
Crystal.prototype.constructor = p2;

Crystal.prototype.clientType = 'Crystal';
Crystal.prototype.serverType = 'Crystal';

Crystal.prototype.value = 50;

Crystal.prototype.beginContact = function (other) {
    switch (other.serverType) {
        case 'Ship':
            if (!this.pickedup) {
                this.pickedup = true;
                other.crystals += this.value;
                this.starcoder.sendMessage(other.player, 'crystal', this.value);
                //other.player.sendMessage('crystal pickup', this.value);
                this.removeSelfFromWorld();
            }
            break;
    }
};

module.exports = Crystal;
