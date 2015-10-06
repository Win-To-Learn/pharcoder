/**
 * ControlEndPoint.js
 */
'use strict';

module.exports = {
    onReadyCB: function (player) {
        var self = this;
        player.socket.on('do', function (actions) {
            for (var i = 0, l = actions.length; i < l; i++) {
                self.doAction(player, actions[i]);
            }
        });
    },

    doAction: function (player, action) {
        var ship = player.getShip();
        switch (action.type) {
            case 'right_pressed':
                ship.state.turn = 1;
                break;
            case 'right_released':
                ship.state.turn = 0;
                break;
            case 'left_pressed':
                ship.state.turn = -1;
                break;
            case 'left_released':
                ship.state.turn = 0;
                break;
            case 'up_pressed':
                ship.state.thrust = 1;
                break;
            case 'up_released':
                ship.state.thrust = 0;
                break;
            case 'down_pressed':
                ship.state.thrust = -1;
                break;
            case 'down_released':
                ship.state.thrust = 0;
                break;
            case 'fire_pressed':
                ship.state.firing = true;
                break;
            case 'fire_released':
                ship.state.firing = false;
                break;
            case 'tractor_pressed':
                ship.state.tractorFiring = true;
                break;
            //case 'tractor_released':
            //    ship.state.tractorFiring = false;
            //    break;
        }
    }
};