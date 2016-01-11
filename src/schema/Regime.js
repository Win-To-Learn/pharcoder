/**
 * Regime.js
 *
 * Represents a set logical set of users (school, class, guests, demo subscribers, etc.)
 */
'use strict';

/**
 * Organizational unit for Starcoder management
 * @param {string} name
 * @param {string} description
 * @param {object} owner - Contact info for responsible party
 * @param {string} ownerId - Id for owner in Starcoder registry
 * @param {string} parentId - Id for parent Regime
 * @constructor
 */
var Regime = function (name, description, owner, ownerId, parentId) {
    this.init();
    this.name = name;
    this.description = description;
    this.owner = owner;
    this.ownerId = ownerId;
    this.parentId = parentId;
};

Regime.prototype.cType = 'Regime';

Regime.prototype.init = function () {
    /**
     * Registration codes
     * @type {string[]}
     */
    this.regCodes = [];

    /**
     * Properties for each registration code (reusable or not, trial or not)
     * @type {object}
     */
    this.regCodeProps = {};
};

/**
 * Restore from database
 * @param {object} record
 */
Regime.prototype.restore = function (record) {
    this.id = record._id.toHexString();
    this.name = record.name;
    this.description = record.description;
    this.owner = record.owner;
    this.ownerId = record.ownerId;
    this.regCodes = record.regCodes;
    this.regCodeProps = record.regCodeProps;
};

/**
 * Add new registration code with props (doesn't check for uniqueness)
 * @param {string} code
 * @param {boolean} reusable - Is this code resuable or one time use
 * @param {boolean} trial - Is this code for a trial or full account
 */
Regime.prototype.addRegCode = function (code, reusable, trial) {
    this.regCodes.push(code);
    this.regCodeProps[code] = {reusable: reusable, trial: trial};
};

var s = '23456789ABDEGHIJKLMNPQRTUVWXYZ';

Regime.genCode = function (n) {
    return Array(n).join().split(',').map(function () {return s.charAt(Math.floor(Math.random() * s.length))}).join('');
};

module.exports = Regime;
