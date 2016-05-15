/**
 * ControlInterface.js
 */
'use strict';

module.exports = {
    init: function () {
        setHandlers(this, defaultHandlers);
    }
};

var setHandlers = function (starcoder, handlers) {
    for (var e in handlers) {
        starcoder.events.on('msg:' + e, handlers[e].bind(starcoder));
    }
};

var defaultHandlers = {
    up: function (player, state) {
        if (state) {
            player.ship.state.thrust = 1;
            player.ship.thrustState = 1;            // Stupidly redundant FIXME
            player.accomplish('thrust');
        } else {
            player.ship.state.thrust = 0;
            player.ship.thrustState = 0;
            player.accomplish('stopthrust');
        }
    },
    down: function (player, state) {
        if (state) {
            player.ship.state.thrust = -1;
        } else {
            player.ship.state.thrust = 0;
        }
    },
    left: function (player, state) {
        if (state) {
            player.ship.state.turn = -1;
            player.accomplish('turnleft');
        } else {
            player.ship.state.turn = 0;
            player.accomplish('stopturning')
        }
    },
    right: function (player, state) {
        if (state) {
            player.ship.state.turn = 1;
            player.accomplish('turnright');
        } else {
            player.ship.state.turn = 0;
            player.accomplish('stopturning')
        }
    },
    fire: function (player, state) {
        player.ship.state.firing = state;
    },
    tractor: function (player, state) {
        if (state) {
            player.ship.state.tractorFiring = true;
        }
    }
};