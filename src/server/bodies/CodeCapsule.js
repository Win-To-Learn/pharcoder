/**
 * CodeCapsule.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');
var Common = require('../../common/bodies/CodeCapsule.js');

var CodeCapsule = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0.75;
    this.angularDamping = .25;
};

CodeCapsule.prototype = Object.create(SyncBodyBase.prototype);
CodeCapsule.prototype.constructor = CodeCapsule;

Starcoder.mixinPrototype(CodeCapsule.prototype, Common);

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
