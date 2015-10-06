/**
 * Created by jay on 9/14/15.
 */
'use strict';

var Player = require('./Player.js');

var TrialPlayer = function () { };

TrialPlayer.prototype = Object.create(Player.prototype);
TrialPlayer.prototype.constructor = TrialPlayer;

module.exports = TrialPlayer;