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
            //player.getShip().velocity[0] = 5;
            ship.angularForce = 600;
            break;
        case 'right_released':
            //player.getShip().velocity[0] = 0;
            ship.angularForce = 0;
            ship.angularVelocity = 0;
            break;
        case 'left_pressed':
            //player.getShip().velocity[0] = -5;
            ship.angularForce = -600;
            break;
        case 'left_released':
            //player.getShip().velocity[0] = 0;
            ship.angularForce = 0;
            ship.angularVelocity = 0;
            break;
        case 'up_pressed':
            ship.force[0] = Math.sin(ship.angle)*5000;
            ship.force[1] = -Math.cos(ship.angle)*5000;
            break;
        case 'up_released':
            ship.force[0] = 0;
            ship.force[1] = 0;
            ship.velocity[0] = 0;
            ship.velocity[1] = 0;
            break;
        case 'down_pressed':
            ship.force[0] = -Math.sin(ship.angle)*5000;
            ship.force[1] = Math.cos(ship.angle)*5000;
            break;
        case 'down_released':
            ship.force[0] = 0;
            ship.force[1] = 0;
            ship.velocity[0] = 0;
            ship.velocity[1] = 0;
            break;
    }
};

module.exports = ControlEndPoint;