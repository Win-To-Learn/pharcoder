/**
 * CodeEndpointServer.js
 *
 * Receive requests to run code, authorize and stage execution, return results
 */
'use strict';

var Interpreter = require('../js-interp/interpreter.js');

var CodeEndpointServer = function () {};

/**
 * Initialize interface
 */
CodeEndpointServer.prototype.initCodeEndpointServer = function () {
    this.clientReadyFunctions.push(this.attachHandler.bind(this));
};

/**
 * Attach network handlers for each player
 *
 * @param player {Player}
 */
CodeEndpointServer.prototype.attachHandler = function (player) {
    var self = this;
    player.socket.on('code', function (code) {
        if (player.interpreter) {
            // Code already running - push onto queue
            player.codeQueue.push(code);
        } else {
            // No code running - create an interpreter and start scheduling steps
            //player.interpreter = new Interpreter(code, self.initInterpreter.bind(self));
            player.interpreter = self.newInterpreter(code, player);
            setImmediate(self.interpreterStep.bind(self), player);
        }
    });
};

/**
 * Create new Js-Interpreter sandbox with Starcoder API
 *
 * @param code
 * @param player
 * @returns {Interpreter}
 */
CodeEndpointServer.prototype.newInterpreter = function (code, player) {
    var starcoder = this;
    var initFunc = function (interpreter, scope) {
        // FIXME: Just proof of concept. Need to be more systematic about api
        // changeColor
        var wrapper = function (color) {
            player.getShip().lineColor = color.toString();
        };
        interpreter.setProperty(scope, 'changeColor', interpreter.createNativeFunction(wrapper));
        // setScale
        wrapper = function (scale) {
            player.getShip().vectorScale = scale.toNumber();
        };
        interpreter.setProperty(scope, 'setScale', interpreter.createNativeFunction(wrapper));
        // changeShape
        wrapper = function (shape) {
            //console.dir(shape);
            var points = [];
            for (var i = 0, l = shape.length; i < l; i++) {
                points.push([shape.properties[i].properties[0].toNumber(),
                    shape.properties[i].properties[1].toNumber()]);
            }
            player.getShip().shape = points;
        };
        interpreter.setProperty(scope, 'changeShape', interpreter.createNativeFunction(wrapper));
    };
    return new Interpreter(code, initFunc);
};

/**
 * Execute a step of the interpreter for the given player
 *
 * @param player {Player}
 */
CodeEndpointServer.prototype.interpreterStep = function (player) {
    // TODO: error handling, loop detection, throttling, possibly allowing more than one step per cycle
    var running = player.interpreter.step();
    if (running) {
        // Schedule next step
        setImmediate(this.interpreterStep.bind(this), player);
    } else if (player.codeQueue.length > 0) {
        // Get next code and schedule next step
        var code = player.codeQueue.shift();
        //player.interpreter = new Interpreter(code, this.initInterpreter.bind(this));
        player.interpreter = self.newInterpreter(code, player);
        setImmediate(this.interpreterStep.bind(this), player);
    } else {
        // Done for now
        player.interpreter = null;
    }
};

module.exports = CodeEndpointServer;