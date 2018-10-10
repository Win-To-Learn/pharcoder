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

var api_key = 'key-426b722a669becf8c90a677a8409f907';
var domain = 'sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

module.exports = {
    /**
     * Attach network handlers for each player
     *
     * @param player {Player}
     */
    ready: function (player) {
        var self = this;

        var solLoop1 = "for (var count = 0; count < 1000; count++)" +
            " {\n  changeShipColor('#ff0000');\n  changeShipColor('#ffff66');\n  changeShipColor('#3366ff');\n}";


        var solLoop2 = "setTimer(function () {\n" +
            "  pointToBody(localScan(\"Asteroid\"));\n" +
            "  shoot();\n" +
        "}, 1, true);";

        var solConditional1 = "//change the *** to point and thrust towards crystals if closer than 300 units\n" +
        "//note: some valuable crystals are hidden!\n\n"+
            "var distance = distanceScan(\"Crystal\");\n\n" +
            "if(distance<300){\n" +
            "  pointToBody(closestBody(\"Crystal\"));\n" +
            "  thrust(6);\n" +
            "}";



        player.socket.on('code exec', function (code) {

            //console.log(code);
            var data = {
                from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
                to: 'jonathanmartinnyc@gmail.com',
                subject: 'Student Progress',
                text: 'Your child or student - ' + player.gamertag + ' - has just completed the first loop challenge'
            };
            var data2 = {
                from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
                to: 'johndh88@gmail.com',
                subject: 'Student Progress',
                text: 'Your child or student - ' + player.gamertag + ' - has just completed the first loop challenge'
            };
            var data3 = {
                from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
                to: 'jonathanmartinnyc@gmail.com',
                subject: 'Student Progress',
                text: 'Your child or student - ' + player.gamertag + ' - has just completed the autoaim timer' +
                ' loop challenge'
            };
            var data4 = {
                from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
                to: 'johndh88@gmail.com',
                subject: 'Student Progress',
                text: 'Your child or student - ' + player.gamertag + ' - has just completed the autoaim timer' +
                ' loop challenge'
            };
            var data5 = {
                from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
                to: 'jonathanmartinnyc@gmail.com',
                subject: 'Student Progress',
                text: 'Your child or student - ' + player.gamertag + ' - has just completed the if/then challenge'
            };
            var data6 = {
                from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
                to: 'johndh88@gmail.com',
                subject: 'Student Progress',
                text: 'Your child or student - ' + player.gamertag + ' - has just completed the if/then challenge'
            };



            if(code.trim()==solLoop1.trim() && player.challenge2===false){
                //console.log("loop solved");
                player.challenge2 = true;
                self.updatePlayerScore('Code Challenges', player.id, 5);

                setTimeout(function(){
                    self.sendMessage(player, 'challengewon2', 'Good job solving the loop challenge!');
                },500);
                player.getShip().crystals += 150;
                if (player.role === 'player') {
                    if(player.timestamp_old) {
                        if (player.timestamp_old + 5000 < player.timestamp_new) {
                            mailgun.messages().send(data, function (error, body) {
                            });
                            mailgun.messages().send(data2, function (error, body) {
                            });
                        }
                    }
                    else{
                        mailgun.messages().send(data, function (error, body) {
                        });
                        mailgun.messages().send(data2, function (error, body) {
                        });
                    }
                    player.timestamp_old = player.timestamp_new;
                    //console.log(data);
                }
            }

            if(code.trim()==solLoop2.trim() && player.challenge4===false){
                //console.log("loop solved");
                player.challenge4 = true;
                self.updatePlayerScore('Code Challenges', player.id, 5);

                setTimeout(function(){
                    self.sendMessage(player, 'challengewon4', 'Good job solving the autoaim timer loop challenge!');
                },500);
                player.getShip().crystals += 100;
                if (player.role === 'player') {
                    if(player.timestamp_old) {
                        if (player.timestamp_old + 5000 < player.timestamp_new) {
                            mailgun.messages().send(data3, function (error, body) {
                            });
                            mailgun.messages().send(data4, function (error, body) {
                            });
                        }
                    }
                    else{
                        mailgun.messages().send(data3, function (error, body) {
                        });
                        mailgun.messages().send(data4, function (error, body) {
                        });
                    }
                    player.timestamp_old = player.timestamp_new;
                    //console.log(data);
                }
            }

            if((code.trim()==solConditional1.trim() || code ==solConditional1) && player.challenge5===false){
                //console.log("hidden crystal challenge solved");
                player.challenge5 = true;
                self.updatePlayerScore('Code Challenges', player.id, 10);

                setTimeout(function(){
                    self.sendMessage(player, 'challengewon5', 'Good job solving the conditional challenge!');
                },500);
                player.getShip().crystals += 150;
                if (player.role === 'player') {
                    if(player.timestamp_old) {
                        if (player.timestamp_old + 5000 < player.timestamp_new) {
                            mailgun.messages().send(data5, function (error, body) {
                            });
                            mailgun.messages().send(data6, function (error, body) {
                            });
                        }
                    }
                    else{
                        mailgun.messages().send(data5, function (error, body) {
                        });
                        mailgun.messages().send(data6, function (error, body) {
                        });
                    }
                    player.timestamp_old = player.timestamp_new;

                }
            }

            if(code === 'var coordinate1 = 100;\n\ntranslate(coordinate1,0);\n'){
                //console.log("you got it");

                //self.starcoder.updatePlayerScore('Loop Challenges', player.id, 50);
                //self.starcoder.sendMessage(player, 'challengewon', 'Nice!');

            }
            try {
                // if (player.interpreter) {
                //     // Code already running - push onto queue
                //     //player.codeQueue.push(code);
                //     player.interpreter.addEvent(code);
                // } else {
                // No code running - create an code and start scheduling steps
                //player.code = new Interpreter(code, self.initInterpreter.bind(self));
                //player.code = self.newInterpreter(code, player);
                if (player.interpreter) {
                    player.interpreter.cleanup();
                    if (player.interpreter.nextTimeout) {
                        clearTimeout(player.interpreter.nextTimeout);
                        player.interpreter.nextTimeout = null;
                    }
                }
                player.interpreter = new Interpreter(player);
                player.interpreter.addEvent(code);
                player.interpreter.nextTimeout = setTimeout(self.interpreterStep.bind(self), self.config.interpreterRate * 1000, player);
                player.interpreter.lastIdle = self.hrtime();
                player.interpreter.lastStatus = 'ok';
                // }
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
            if(player.codeSnippets['example9'] == null){
                var js_ex9 = "var coordinateX = 200;\nvar coordinateY =" +
                    " 0;\nfor(coordinateY= ;coordinateY<  ;coordinateY+= ){" +
                "\nfor(coordinateX=200;coordinateX<255;coordinateX+=5){" +
                "\ntranslate(coordinateX,coordinateY);" +
                "\n}\n}";
                player.codeSnippets['example9'] = {js: js_ex9};
                self.sendCodeMessage(player, 'saved', 'example9');
            }
            if(player.codeSnippets['example10'] == null){
                var blockly_ex8 = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"sc_set_timer\" id=\"50\"' +
                    ' x=\"44\" y=\"79\"><field name=\"REPEAT\">FALSE</field><value name=\"TIMEOUT\"><block' +
                    ' type=\"math_number\" id=\"51\"><field name=\"NUM\">1</field></block></value></block><block' +
                    ' type=\"sc_point_to_body\" id=\"52\" x=\"182\" y=\"88\"></block><block type=\"sc_scan\"' +
                    ' id=\"53\" x=\"338\" y=\"85\"><field name=\"BODYTYPE\">Asteroid</field></block><block' +
                    ' type=\"sc_shoot\" id=\"54\" x=\"250\" y=\"136\"></block></xml>';
            

                player.codeSnippets['example10'] = {blockly: blockly_ex8};
                self.sendCodeMessage(player, 'saved', 'example10');
            }
            if(player.codeSnippets['example11'] == null){
                var js_ex11 = "//change the *** to point and thrust towards crystals if closer than 300 units\n" +
                    "//note: some valuable crystals are hidden!\n\n"+
                    "var distance = distanceScan(\"Crystal\");\n\n" +
                    "if(distance<***){\n" +
                    "  pointToBody(closestBody(\"*******\"));\n" +
                    "  thrust(6);\n" +
                    "}";
                player.codeSnippets['example11'] = {js: js_ex11};
                self.sendCodeMessage(player, 'saved', 'example11');
            }
            if(player.codeSnippets['example12'] == null){
                var blockly_ex12 = '<xml xmlns="http://www.w3.org/1999/xhtml\"><block type=\"sc_set_color\" id=\"48\"' +
                    ' x=\"39\" y=\"49\"><field name=\"COLOR\">#ff0000</field></block></xml>';
                player.codeSnippets['example12'] = {blockly: blockly_ex12};
                self.sendCodeMessage(player, 'saved', 'example12');
            }
            if(player.codeSnippets['example20'] == null){
                var blockly_ex20 = '<xml xmlns=\"http://www.w3.org/1999/xhtml\"><variables></variables><block type=\"variables_set\" id=\")01aa}Tvro}iGk$]^/q{\" x=\"85\" y=\"57\"><field name=\"VAR\">item1</field><next><block type=\"variables_set\" id=\"iJp]!5[!v;AWRK~E;kO|\"><field name=\"VAR\">item2</field></block></next></block><block type=\"math_number\" id=\"ond;aA)JRrOY$$E,V;w`\" x=\"257\" y=\"58\"><field name=\"NUM\">230</field></block><block type=\"math_number\" id=\"_ebn]oiT]afAeW}t}=j?\" x=\"257\" y=\"85\"><field name=\"NUM\">100</field></block><block type=\"sc_translate\" id=\"MNBR0t(w0tgc72tGEE2r\" x=\"86\" y=\"141\"></block><block type=\"variables_get\" id=\"q]Z(oUnTf@]xSU]_,#hi\" x=\"191\" y=\"212\"><field name=\"VAR\">item1</field></block><block type=\"variables_get\" id=\"4,-q/koTgU9RX0*`j]}Z\" x=\"281\" y=\"213\"><field name=\"VAR\">item2</field></block></xml>';
                player.codeSnippets['example20'] = {blockly: blockly_ex20};
                self.sendCodeMessage(player, 'saved', 'example20');
            }


            if(player.codeSnippets['example21'] == null){
                var js_ex21 = "//set variable coordinateX and coordinateY to 0 (replace the '***').\n" +
                    "//Inside the for loop, assign 0 to the starting value of coordinateX (replace the '*').\n" +
                    "//Make the loop check if the current value is less than 45 (replace the '**'). (hint: '<' is the less than operator)\n"+
                    "//Increase coordinateX by 5 (replace the '***'). (hint: '+=' is the operator for incrementing a value)\n"+
                    "\n\n"+
                    "var coordinateX = ***;\n\n" +
                    "var coordinateY = ***;\n\n" +
                    "for(coordinateX = * ;coordinateX < ** ;coordinateX += *** ){\n" +
                    "  translate(coordinateX,coordinateY);\n" +
                    "}";
                player.codeSnippets['example21'] = {js: js_ex21};
                self.sendCodeMessage(player, 'saved', 'example21');
            }

            if(player.codeSnippets['example22'] == null){
                var js_ex22 = "//set variable A and B to two different values so that A is greater than B (replace the '***').\n" +
                    "//A must be always greater than B for the code to work. Try different values.\n" +
                    "\n\n"+
                    "var A = ***;\n\n" +
                    "var B = ***;\n\n" +
                    "if(A > B){\n" +
                    "  translate(50,300);\n" +
                    "}";
                player.codeSnippets['example22'] = {js: js_ex22};
                self.sendCodeMessage(player, 'saved', 'example22');
            }

            if(player.codeSnippets['example23'] == null){
                var js_ex23 = "//set variable A, B and C to three different values so that A is less than B,\n" +
                    "//and C is greater than B (replace the '***').\n"+
                    "//A must be always less than B and C must be always greater than B for the code to work. Try different values.\n" +
                    "\n\n"+
                    "var A = ***;\n\n" +
                    "var B = ***;\n\n" +
                    "var C = ***;\n\n" +
                    "if(A < B && C > B){\n" +
                    "  translate(150,-70);\n" +
                    "  changeShipColor('#f4d9f1');\n" +
                    "}";
                player.codeSnippets['example23'] = {js: js_ex23};
                self.sendCodeMessage(player, 'saved', 'example23');
            }

            var code = player.codeSnippets[label];


            if (code) {
                //console.log(code);
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
            player.interpreter.nextTimeout = setTimeout(this.interpreterStep.bind(this), this.config.interpreterRate * 1000, player);
        } else if (player.interpreter) {
            // Done for now
            player.interpreter.cleanup();
            player.interpreter = null;
        }
    },

    sendCodeMessage: function (player, kind, data) {
        player.socket.emit('code ' + kind, data);
    }
};