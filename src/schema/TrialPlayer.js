/**
 * TrialPlayer.js
 */
'use strict';

var Player = require('./Player.js');

var TrialPlayer = function (gamertag, password, regime, role, demographics) {
    this.init();
    this.gamertag = gamertag;
    this.password = password;
    this.passwordClear = true;
    this.role = role;
    if (demographics) {
        this.demographics = demographics;       // FIXME: Probably want to destructure
    }
};

TrialPlayer.prototype = Object.create(Player.prototype);
TrialPlayer.prototype.constructor = TrialPlayer;

TrialPlayer.prototype.cType = 'TrialPlayer';

module.exports = TrialPlayer;