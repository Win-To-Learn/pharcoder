/**
 * PlayerFactory.js
 */
'use strict';

var playerTypes = {
    player: require('./Player.js'),
    guest: require('./Guest.js')
};

module.exports = {
    create: function (role, args) {
        var p = new playerTypes[role]();
        p.init.apply(p, args);
        return p;
    },

    fromDB: function (rec) {
        var p = new playerTypes[rec.role]();
        p.fromDB(rec);
        return p;
    }
};