/**
 * CodeEndpointServer.js
 *
 * Receive requests to run code, authorize and stage execution, return results
 */
'use strict';

//var Interpreter = require('../js-interp/interpreter.js');
var Interpreter = require('../server/interpreter/Interpreter.js');

var Planetoid = require('../serverbodies/Planetoid.js');

var API = require('../server/interpreter/API.js');
//var Marshal = require('../server/interpreter/Marshal.js');

module.exports = {
    /**
     * Attach network handlers for each player
     *
     * @param player {Player}
     */
    onReadyCB: function (player) {
        var self = this;
        player.socket.on('code', function (code) {
            try {
                if (player.interpreter) {
                    // Code already running - push onto queue
                    //player.codeQueue.push(code);
                    player.interpreter.addEvent(code);
                } else {
                    // No code running - create an interpreter and start scheduling steps
                    //player.interpreter = new Interpreter(code, self.initInterpreter.bind(self));
                    //player.interpreter = self.newInterpreter(code, player);
                    player.interpreter = new Interpreter(player);
                    player.interpreter.addEvent(code);
                    setTimeout(self.interpreterStep.bind(self), self.config.interpreterRate * 1000, player);
                    player.interpreter.lastIdle = self.hrtime();
                    player.interpreter.lastStatus = 'ok';
                }
            } catch (error) {
                self.sendCodeMessage(player, 'syntax error', error);
            }
        });
    },

    /**
     * Execute a step of the interpreter for the given player
     *
     * @param player {Player}
     */
    interpreterStep: function (player) {
        // TODO: error handling, loop detection, throttling, possibly allowing more than one step per cycle
        try {
            var running = player.interpreter.step();
        } catch (error) {
            this.sendCodeMessage(player, 'runtime error', error);
            running = false;
        }
        if (running) {
            // Update status
            var now = this.hrtime();
            if (player.interpreter.idle) {
                player.interpreter.lastIdle = now;
                if (player.interpreter.lastStatus !== 'ok') {
                    this.sendCodeMessage(player, 'status', 'ok');
                    player.interpreter.lastStatus = 'ok';
                }
            }
            var interval = (now - player.interpreter.lastIdle) / 1000;
            //console.log('INT', interval);
            if (interval > this.config.interpreterStatusThresholds.kill) {
                this.sendCodeMessage(player, 'status', 'killed');
                player.interpreter.cleanup();
                player.interpreter = null;
                return;
            } else if (interval > this.config.interpreterStatusThresholds.critical &&
                    player.interpreter.lastStatus === 'warn') {
                this.sendCodeMessage(player, 'status', 'critical');
                player.interpreter.lastStatus = 'critical';
            } else if (interval > this.config.interpreterStatusThresholds.warn &&
                    player.interpreter.lastStatus === 'ok') {
                this.sendCodeMessage(player, 'status', 'warn');
                player.interpreter.lastStatus = 'warn';
            }
            // Schedule next step
            setTimeout(this.interpreterStep.bind(this), this.config.interpreterRate * 1000, player);
        } else {
            // Done for now
            player.interpreter.cleanup();
            player.interpreter = null;
        }
    },

    sendCodeMessage: function (player, kind, data) {
        player.socket.emit('code ' + kind, data);
    }
};