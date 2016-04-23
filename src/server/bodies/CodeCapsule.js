/**
 * CodeCapsule.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var CodeCapsule = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    this.damping = 0.75;
    this.angularDamping = .25;
};

CodeCapsule.prototype = Object.create(SyncBodyBase.prototype);
CodeCapsule.prototype.constructor = CodeCapsule;

CodeCapsule.prototype.clientType = 'CodeCapsule';
CodeCapsule.prototype.serverType = 'CodeCapsule';

CodeCapsule.prototype.beginContact = function (other) {
    switch (other.serverType) {
        case 'Ship':
            if (!this.pickedup) {
                this.pickedup = true;
                other.player.sendMessage('code pickup', this.payload);
                this.removeSelfFromWorld();
            }
            break;
    }
};

module.exports = CodeCapsule;
