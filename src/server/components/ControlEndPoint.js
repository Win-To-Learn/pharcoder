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
                //ship.player.tutorial.transition('turnright');
                ship.player.achieve('turnright');
                break;
            case 'right_released':
                ship.state.turn = 0;
                //ship.player.tutorial.transition('stopturning');
                ship.player.achieve('stopturning');
                break;
            case 'left_pressed':
                ship.state.turn = -1;
                //ship.player.tutorial.transition('turnleft');
                ship.player.achieve('turnleft');
                break;
            case 'left_released':
                ship.state.turn = 0;
                //ship.player.tutorial.transition('stopturning');
                ship.player.achieve('stopturning');
                break;
            case 'up_pressed':
                ship.state.thrust = 1;
                //ship.player.tutorial.transition('thrust');
                ship.player.achieve('thrust');
                break;
            case 'up_released':
                ship.state.thrust = 0;
                //ship.player.tutorial.transition('stopthrust');
                ship.player.achieve('stopthrust');
                break;
            case 'down_pressed':
                ship.state.thrust = -1;
                //ship.player.tutorial.transition('retrothrust');
                ship.player.achieve('retrothrust');
                break;
            case 'down_released':
                ship.state.thrust = 0;
                //ship.player.tutorial.transition('stopthrust');
                ship.player.achieve('stopthrust');
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