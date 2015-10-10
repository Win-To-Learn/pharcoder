/**
 * CodeEndpointServer.js
 *
 * Receive requests to run code, authorize and stage execution, return results
 */
'use strict';

//var Interpreter = require('../js-interp/code.js');
var Interpreter = require('../code/Interpreter.js');

var Planetoid = require('../bodies/Planetoid.js');

var API = require('../code/API.js');

module.exports = {
    /**
     * Attach network handlers for each player
     *
     * @param player {Player}
     */
    onReadyCB: function (player) {
        var self = this;
        player.socket.on('code exec', function (code) {
            try {
                if (player.interpreter) {
                    // Code already running - push onto queue
                    //player.codeQueue.push(code);
                    player.interpreter.addEvent(code);
                } else {
                    // No code running - create an code and start scheduling steps
                    //player.code = new Interpreter(code, self.initInterpreter.bind(self));
                    //player.code = self.newInterpreter(code, player);
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
        player.socket.on('code save', function (code) {
            //console.log('save code', code);
            if (code.js) {
                player.codeSnippets[code.label] =  {js: code.js};
            } else {
                player.codeSnippets[code.label] = {blockly: code.blockly};
            }
            if (player.role === 'player') {
                console.log('savingto db');
                self.updatePlayerSnippets(player, function () {
                    self.sendCodeMessage(player, 'saved', code.label);
                });
            } else {
                console.log('guest no save');
                self.sendCodeMessage(player, 'saved', code.label);
            }
        });
        player.socket.on('code load', function (label) {
            console.log('load code', label);
            var code = player.codeSnippets[label];
            if (code) {
                if (code.js) {
                    self.sendCodeMessage(player, 'loaded', {label: label, js: code.js});
                } else {
                    self.sendCodeMessage(player, 'loaded', {label: label, blockly: code.blockly});
                }
            }
        });
        // Send code labels
        this.sendCodeMessage(player, 'labels', Object.keys(player.codeSnippets));
    },

    /**
     * Execute a step of the code for the given player
     *
     * @param player {Player}
     */
    interpreterStep: function (player) {
        // TODO: error handling, loop detection, throttling, possibly allowing more than one step per cycle
        try {
            var running = player.interpreter.step();
        } catch (error) {
            console.log(error);
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