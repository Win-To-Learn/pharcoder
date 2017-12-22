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
    ready: function (player) {
        var self = this;
        player.socket.on('code exec', function (code) {
            console.log(code);
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
                //player.codeSnippets['test1'] = {blockly: code.blockly};
            }
            if (player.role === 'player') {
                //console.log('savingto db');
                self.updatePlayerSnippets(player, function () {
                    self.sendCodeMessage(player, 'saved', code.label);
                    //self.sendCodeMessage(player, 'saved', 'test1');
                });
            } else {
                //console.log('guest no save');
                self.sendCodeMessage(player, 'not saved', code.label);
            }
        });
        player.socket.on('code load', function (label) {
            
            if(player.codeSnippets['example1'] == null){
                var blockly_ex1 = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"sc_change_shape\" id=\"48\" x=\"80\" y=\"57\"><value name=\"PAIRS\"><block type=\"lists_create_with\" id=\"65\"><mutation items=\"3\"></mutation><value name=\"ADD0\"><block type=\"sc_pair\" id=\"113\"><value name=\"X\"><block type=\"math_number\" id=\"114\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"115\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"ADD1\"><block type=\"sc_pair\" id=\"116\"><value name=\"X\"><block type=\"math_number\" id=\"117\"><field name=\"NUM\">3</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"118\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"ADD2\"><block type=\"sc_pair\" id=\"126\"><value name=\"X\"><block type=\"math_number\" id=\"127\"><field name=\"NUM\">3</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"128\"><field name=\"NUM\">3</field></block></value></block></value></block></value></block></xml>';
                player.codeSnippets['example1'] = {blockly: blockly_ex1};
                self.sendCodeMessage(player, 'saved', 'example1');
            }
            if(player.codeSnippets['example2'] == null){
                var blockly_ex2 = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"sc_change_shape\"' +
                    ' id=\"176\" x=\"85\" y=\"77\"><value name=\"PAIRS\"><block type=\"lists_create_with\" id=\"193\"><mutation items=\"3\"></mutation><value name=\"ADD0\"><block type=\"sc_pair\" id=\"241\"><value name=\"X\"><block type=\"math_number\" id=\"242\"><field name=\"NUM\">-1</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"243\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"ADD1\"><block type=\"sc_pair\" id=\"244\"><value name=\"X\"><block type=\"math_number\" id=\"245\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"246\"><field name=\"NUM\">3</field></block></value></block></value><value name=\"ADD2\"><block type=\"sc_pair\" id=\"247\"><value name=\"X\"><block type=\"math_number\" id=\"248\"><field name=\"NUM\">1</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"249\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></xml>' ;
                player.codeSnippets['example2'] = {blockly: blockly_ex2};
                self.sendCodeMessage(player, 'saved', 'example2');
            }
            if(player.codeSnippets['example3'] == null){
                var blockly_ex3 = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"sc_set_seeder_props\"' +
                    ' id=\"297\" x=\"136\" y=\"63\"><value name=\"TL\"><block type=\"math_number\" id=\"298\"><field name=\"NUM\">2</field></block></value><value name=\"BF\"><block type=\"math_number\" id=\"299\"><field name=\"NUM\">4</field></block></value><value name=\"BD\"><block type=\"math_number\" id=\"300\"><field name=\"NUM\">0.9</field></block></value><value name=\"SP\"><block type=\"math_number\" id=\"301\"><field name=\"NUM\">135</field></block></value><value name=\"DP\"><block type=\"math_number\" id=\"302\"><field name=\"NUM\">4</field></block></value></block></xml>';
                player.codeSnippets['example3'] = {blockly: blockly_ex3};
                self.sendCodeMessage(player, 'saved', 'example3');
            }
            if(player.codeSnippets['example4'] == null){
                var blockly_ex4 = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"variables_set\"' +
                    ' id=\"305\" x=\"-50\" y=\"40\"><field name=\"VAR\">i</field><value name=\"VALUE\"><block type=\"math_number\" id=\"465\"><field name=\"NUM\">0</field></block></value><next><block type=\"sc_set_timer\" id=\"418\"><field name=\"REPEAT\">TRUE</field><statement name=\"STATEMENTS\"><block type=\"sc_change_shape\" id=\"353\"><value name=\"PAIRS\"><block type=\"lists_create_with\" id=\"370\"><mutation items=\"3\"></mutation><value name=\"ADD0\"><block type=\"sc_pair\" id=\"516\"><value name=\"X\"><block type=\"math_number\" id=\"517\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"518\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"ADD1\"><block type=\"sc_pair\" id=\"519\"><value name=\"X\"><block type=\"math_number\" id=\"520\"><field name=\"NUM\">3</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"521\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"ADD2\"><block type=\"sc_pair\" id=\"522\"><value name=\"X\"><block type=\"math_number\" id=\"523\"><field name=\"NUM\">3</field></block></value><value name=\"Y\"><block type=\"variables_get\" id=\"468\"><field name=\"VAR\">i</field></block></value></block></value></block></value><next><block type=\"variables_set\" id=\"525\"><field name=\"VAR\">i</field><value name=\"VALUE\"><block type=\"math_arithmetic\" id=\"438\"><field name=\"OP\">ADD</field><value name=\"A\"><block type=\"variables_get\" id=\"527\"><field name=\"VAR\">i</field></block></value><value name=\"B\"><block type=\"math_number\" id=\"526\"><field name=\"NUM\">0.2</field></block></value></block></value><next><block type=\"controls_if\" id=\"446\"><value name=\"IF0\"><block type=\"logic_compare\" id=\"535\"><field name=\"OP\">GT</field><value name=\"A\"><block type=\"variables_get\" id=\"536\"><field name=\"VAR\">i</field></block></value><value name=\"B\"><block type=\"math_number\" id=\"419\"><field name=\"NUM\">3</field></block></value></block></value><statement name=\"DO0\"><block type=\"variables_set\" id=\"537\"><field name=\"VAR\">i</field><value name=\"VALUE\"><block type=\"math_number\" id=\"538\"><field name=\"NUM\">0</field></block></value></block></statement></block></next></block></next></block></statement><value name=\"TIMEOUT\"><block type=\"math_number\" id=\"557\"><field name=\"NUM\">0.1</field></block></value></block></next></block></xml>';
                player.codeSnippets['example4'] = {blockly: blockly_ex4};
                self.sendCodeMessage(player, 'saved', 'example4');
            }
            if(player.codeSnippets['example5'] == null){
                var blockly_ex5 = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"variables_set\"' +
                    ' id=\"305\" x=\"-50\" y=\"40\"><field name=\"VAR\">i</field><value name=\"VALUE\"><block type=\"math_number\" id=\"465\"><field name=\"NUM\">1</field></block></value><next><block type=\"sc_set_timer\" id=\"418\"><field name=\"REPEAT\">TRUE</field><statement name=\"STATEMENTS\"><block type=\"sc_change_shape\" id=\"353\"><value name=\"PAIRS\"><block type=\"lists_create_with\" id=\"370\"><mutation items=\"3\"></mutation><value name=\"ADD0\"><block type=\"sc_pair\" id=\"516\"><value name=\"X\"><block type=\"math_arithmetic\" id=\"558\"><field name=\"OP\">MULTIPLY</field><value name=\"A\"><block type=\"variables_get\" id=\"559\"><field name=\"VAR\">i</field></block></value><value name=\"B\"><block type=\"math_number\" id=\"560\"><field name=\"NUM\">-1</field></block></value></block></value><value name=\"Y\"><block type=\"math_number\" id=\"518\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"ADD1\"><block type=\"sc_pair\" id=\"519\"><value name=\"X\"><block type=\"math_number\" id=\"520\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"521\"><field name=\"NUM\">3</field></block></value></block></value><value name=\"ADD2\"><block type=\"sc_pair\" id=\"522\"><value name=\"X\"><block type=\"math_arithmetic\" id=\"561\"><field name=\"OP\">MULTIPLY</field><value name=\"A\"><block type=\"variables_get\" id=\"562\"><field name=\"VAR\">i</field></block></value><value name=\"B\"><block type=\"math_number\" id=\"563\"><field name=\"NUM\">1</field></block></value></block></value><value name=\"Y\"><block type=\"math_number\" id=\"517\"><field name=\"NUM\">0</field></block></value></block></value></block></value><next><block type=\"variables_set\" id=\"525\"><field name=\"VAR\">i</field><value name=\"VALUE\"><block type=\"math_arithmetic\" id=\"438\"><field name=\"OP\">MINUS</field><value name=\"A\"><block type=\"variables_get\" id=\"527\"><field name=\"VAR\">i</field></block></value><value name=\"B\"><block type=\"math_number\" id=\"526\"><field name=\"NUM\">0.1</field></block></value></block></value><next><block type=\"controls_if\" id=\"446\"><value name=\"IF0\"><block type=\"logic_compare\" id=\"535\"><field name=\"OP\">LTE</field><value name=\"A\"><block type=\"variables_get\" id=\"536\"><field name=\"VAR\">i</field></block></value><value name=\"B\"><block type=\"math_number\" id=\"419\"><field name=\"NUM\">0</field></block></value></block></value><statement name=\"DO0\"><block type=\"variables_set\" id=\"537\"><field name=\"VAR\">i</field><value name=\"VALUE\"><block type=\"math_number\" id=\"538\"><field name=\"NUM\">1</field></block></value></block></statement></block></next></block></next></block></statement><value name=\"TIMEOUT\"><block type=\"math_number\" id=\"557\"><field name=\"NUM\">0.1</field></block></value></block></next></block></xml>';
                player.codeSnippets['example5'] = {blockly: blockly_ex5};
                self.sendCodeMessage(player, 'saved', 'example5');
            }
            if(player.codeSnippets['example6'] == null){
                var blockly_ex6 = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"sc_set_timer\"' +
                    ' id=\"687\" x=\"-836\" y=\"403\"><field name=\"REPEAT\">TRUE</field><statement name=\"STATEMENTS\"><block type=\"sc_point_to_body\" id=\"736\"><value name=\"BODY\"><block type=\"sc_scan\" id=\"784\"><field name=\"BODYTYPE\">Asteroid</field></block></value><next><block type=\"sc_shoot\" id=\"832\"></block></next></block></statement><value name=\"TIMEOUT\"><block type=\"math_number\" id=\"688\"><field name=\"NUM\">1</field></block></value></block></xml>';
                player.codeSnippets['example6'] = {blockly: blockly_ex6};
                self.sendCodeMessage(player, 'saved', 'example6');
            }
            if(player.codeSnippets['example7'] == null){
                var blockly_ex7 = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"controls_repeat_ext\" id=\"201\" x=\"-490\" y=\"69\"><value name=\"TIMES\"><block type=\"math_number\" id=\"202\"><field name=\"NUM\">2</field></block></value></block><block type=\"sc_set_color\" id=\"48\" x=\"-245\" y=\"74\"><field name=\"COLOR\">#ff0000</field></block><block type=\"sc_set_color\" id=\"96\" x=\"-246\" y=\"128\"><field name=\"COLOR\">#ffff66</field></block><block type=\"sc_set_color\" id=\"144\" x=\"-245\" y=\"183\"><field name=\"COLOR\">#3366ff</field></block></xml>';

                player.codeSnippets['example7'] = {blockly: blockly_ex7};
                self.sendCodeMessage(player, 'saved', 'example7');
            }
            if(player.codeSnippets['example8'] == null){
                var js_ex8 = 'var coordinate1 = 100;\n\ntranslate(coordinate1,0);\n';
                player.codeSnippets['example8'] = {js: js_ex8};
                self.sendCodeMessage(player, 'saved', 'example8');
            }

            var code = player.codeSnippets[label];


            if (code) {
                if (code.js) {
                    self.sendCodeMessage(player, 'loaded', {label: label, js: code.js});
                } else {
                    self.sendCodeMessage(player, 'loaded', {label: label, blockly: code.blockly});
                }
            }
        });
        player.socket.on('code deploy', function (code) {
            //console.log(player);
            if (player.role === 'player') {
                player.getShip().deployCodeCapsule(code);
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