/**
 * ControlEndPoint.js
 */
'use strict';

var ControlEndPoint = function () {};

ControlEndPoint.prototype.attachActions = function (player) {
    var self = this;
    player.socket.on('do', function (actions) {
        for (var i = 0, l = actions.length; i < l; i++) {
            self.doAction(player, actions[i]);
        }
    });
};

ControlEndPoint.prototype.doAction = function (player, action) {
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
    }
};

module.exports = ControlEndPoint;