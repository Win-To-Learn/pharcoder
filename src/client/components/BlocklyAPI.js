/**
 * BlocklyAPI.js
 *
 * Definitions and code generation for StarCoder oriented blocks
 */
'use strict';

let Translations = require('./Translations');

module.exports = {
    init: function () {
        // Custom Starcoder blocks
        /**
         * set ship thrust power
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_set_thrust_power'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_set_thrust_power'),
                    args0: [{type: 'input_value', name: 'VALUE', check: 'Number'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 160
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'VALUE', subtype: 'math_number', value: 1000}
                ]
            }
        };

        /**
         * Code generation for set_thrust_power
         *
         * @param block
         * @returns {string}
         */
        Blockly.JavaScript['sc_set_thrust_power'] = function (block) {
            var arg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '1';
            return 'setThrustForce(' + arg + ');\n';
        };

        /**
         * set ship color
         */
        Blockly.Blocks['sc_set_color'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_set_color'),
                    args0: [{type: 'field_colour', name: 'COLOR', colour: '#ff0000'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 30
                });
            },
            starcoder: {}
        };

        /**
         * code generation for set color
         */
        Blockly.JavaScript['sc_set_color'] = function (block) {
            var color = block.getFieldValue('COLOR');
            return 'changeShipColor(\'' + color + '\');\n';
        };
        /**
         * Block to create station block body
         */
        Blockly.Blocks['sc_create_station_block'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_create_station_block'),
                    args0: [{type: 'input_value', name: 'PAIRS', check: 'Array'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 300
                });
            },
            starcoder: {}
        };

        /**
         * Generate code for create station
         */
        Blockly.JavaScript['sc_create_station_block'] = function (block) {
            var pairs = Blockly.JavaScript.valueToCode(block, 'PAIRS', Blockly.JavaScript.ORDER_NONE) || '';
            return 'createStationBlock(' + pairs + ');\n';
        };
        /**
         * Block representing an ordered pair of coordinates
         */
        Blockly.Blocks['sc_pair'] = {
            init: function () {
                this.jsonInit({
                    message0: '(%1,%2)',
                    args0: [
                        {type: 'input_value', name: 'X', check: 'Number'},
                        {type: 'input_value', name: 'Y', check: 'Number'}
                    ],
                    output: 'Pair',
                    colour: 160,
                    inputsInline: true
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'X', subtype: 'math_number', value: 0},
                    {type: 'block', name: 'Y', subtype: 'math_number', value: 0}
                ]
            }
        };

        /**
         * Code generation for pair
         */
        Blockly.JavaScript['sc_pair'] = function (block) {
            var x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_COMMA) || '0';
            var y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_COMMA) || '0';
            return ['[' + x + ',' + y + ']', Blockly.JavaScript.ORDER_ATOMIC];
        };

        /**
         * Block representing a set of ordered pairs to be used as the player's shape
         */

        /**
         * set ship turning power
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_set_turning_power'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_set_turning_power'),
                    args0: [{type: 'input_value', name: 'VALUE', check: 'Number'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 160
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'VALUE', subtype: 'math_number', value: 100}
                ]
            }
        };

        /**
         * Code generation for set_turning_power
         *
         * @param block
         * @returns {string}
         */
        Blockly.JavaScript['sc_set_turning_power'] = function (block) {
            var arg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '1';
            return 'setTurningForce(' + arg + ');\n';
        };


        /**
         * translate ship to new position
         */
        Blockly.Blocks['sc_translate'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_translate'),
                    args0: [
                        {type: 'input_value', name: 'X', check: 'Number'},
                        {type: 'input_value', name: 'Y', check: 'Number'}
                    ],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 240,
                    inputsInline: true
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'X', subtype: 'math_number', value: 0},
                    {type: 'block', name: 'Y', subtype: 'math_number', value: 0}
                ]
            }
        };

        /**
         * code generation for ship translation
         */
        Blockly.JavaScript['sc_translate'] = function (block) {
            var x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_COMMA) || '0';
            var y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_COMMA) || '0';
            return 'translate(' + x + ',' + y + ');\n';
        };

        /**
         * Set scale of player ship
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_set_scale'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_set_scale'),
                    args0: [{type: 'input_value', name: 'VALUE', check: 'Number'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 160
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'VALUE', subtype: 'math_number', value: 1.5}
                ]
            }
        };

        /**
         * Code generation for set_scale
         *
         * @param block
         * @returns {string}
         */
        Blockly.JavaScript['sc_set_scale'] = function (block) {
            var arg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '1';
            return 'setShipScale(' + arg + ');\n';
        };


        Blockly.Blocks['sc_change_shape'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_change_shape'),
                    args0: [{type: 'input_value', name: 'PAIRS', check: 'Array'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 300
                });
            },
            starcoder: {}
        };

        /**
         * Generate code for change shape block
         */
        Blockly.JavaScript['sc_change_shape'] = function (block) {
            var pairs = Blockly.JavaScript.valueToCode(block, 'PAIRS', Blockly.JavaScript.ORDER_NONE) || '[]';
            return 'changeShipShape(' + pairs + ');\n';
        };

        /**
         * Block representing a turtle graphics like movement instruction
         */
        Blockly.Blocks['sc_turtle_command'] = {
            init: function () {
                this.jsonInit({
                    message0: '%1 %2',
                    args0: [
                        {
                            type: 'field_dropdown', name: 'COMMAND',
                            options: [
                                [Translations.getString('sc_turtle_command', 'fd'), 'fd'],
                                [Translations.getString('sc_turtle_command', 'bk'), 'bk'],
                                [Translations.getString('sc_turtle_command', 'rt'), 'rt'],
                                [Translations.getString('sc_turtle_command', 'lt'), 'lt']]
                        },
                        {type: 'input_value', name: 'VAL', check: 'Number'}
                    ],
                    output: 'String',
                    inputsLine: true,
                    colour: 160
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'VAL', subtype: 'math_number', value: 1}
                ]
            }
        };

        /**
         * Code generation for turtle command
         */
        Blockly.JavaScript['sc_turtle_command'] = function (block) {
            var command = block.getFieldValue('COMMAND');
            var val = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_NONE) || '0';
            return ['"' + command + ' ' + val + '"', Blockly.JavaScript.ORDER_ATOMIC];
        };

        /**
         * Block representing a filter turning turtle directions to points
         */
        Blockly.Blocks['sc_directions_to_points'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_directions_to_points'),
                    args0: [{type: 'input_value', name: 'COMMANDS', check: 'Array'}],
                    output: 'Array',
                    colour: 300
                });
            },
            starcoder: {}
        };

        /**
         * Generate code for ordered pair blocks
         */
        Blockly.JavaScript['sc_directions_to_points'] = function (block) {
            var commands = Blockly.JavaScript.valueToCode(block, 'COMMANDS', Blockly.JavaScript.ORDER_NONE) || '[]';
            return ['directionsToPoints(' + commands + ')', Blockly.JavaScript.ORDER_ATOMIC];
        };

        /**
         * create new planet
         */
//Blockly.Blocks['sc_new_planet'] = {
//    init: function () {
//        this.setColour(120);
//        this.appendDummyInput()
//            .appendField('new planet');
//        this.appendDummyInput()
//            .appendField('x')
//            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'X')
//            .appendField('y')
//            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'Y');
//        this.appendDummyInput()
//            .appendField('scale')
//            .appendField(new Blockly.FieldTextInput('2', Blockly.FieldTextInput.numberValidator), 'SCALE');
//        this.setPreviousStatement(true);
//        this.setNextStatement(true);
//    }
//};

        /**
         * code generation for new planet
         */
//Blockly.JavaScript['sc_new_planet'] = function (block) {
//    var x = block.getFieldValue('X');
//    var y = block.getFieldValue('Y');
//    var scale = block.getFieldValue('SCALE');
//    return 'newPlanet(' + x + ',' + y + ',' + scale + ')';
//};

        /**
         * shoot ship's weapon
         */
        Blockly.Blocks['sc_shoot'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_shoot'),
                    previousStatement: null,
                    nextStatement: null,
                    colour: 180
                });
            },
            starcoder: {}
        };

        /**
         * code generation for shoot
         */
        Blockly.JavaScript['sc_shoot'] = function () {
            return 'shoot();\n';
        };


        /*
         * thrust
         */
        Blockly.Blocks['sc_thrust'] = {

            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_thrust'),
                    args0: [{type: 'input_value', name: 'VALUE', check: 'Number'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 180
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'VALUE', subtype: 'math_number', value: 1}
                ]
            }
        };

        /*
         * code generation for thrust
         */

        Blockly.JavaScript['sc_thrust'] = function (block) {
            var arg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '1';
            return 'thrust(' + arg + ');\n';
        };


        Blockly.Blocks['sc_turn'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_turn'),
                    args0: [{type: 'input_value', name: 'VALUE', check: 'Number'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 180
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'VALUE', subtype: 'math_number', value: 1}
                ]
            }
        };


        Blockly.JavaScript['sc_turn'] = function (block) {
            var arg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '1';
            return 'turn(' + arg + ');\n';
        };

        /**
         * set seeder (tree default) properties
         */
        Blockly.Blocks['sc_set_seeder_props'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_set_seeder_props', 'message0'),
                    message1: Translations.getString('sc_set_seeder_props', 'message1'),
                    args1: [
                        {type: 'input_value', name: 'TL', check: 'Number'},
                        {type: 'input_value', name: 'BF', check: 'Number'},
                        {type: 'input_value', name: 'BD', check: 'Number'},
                        {type: 'input_value', name: 'SP', check: 'Number'},
                        {type: 'input_value', name: 'DP', check: 'Number'}
                    ],
                    colour: 210,
                    previousStatement: true,
                    nextStatement: true
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'TL', subtype: 'math_number', value: 2},
                    {type: 'block', name: 'BF', subtype: 'math_number', value: 4},
                    {type: 'block', name: 'BD', subtype: 'math_number', value: 0.7},
                    {type: 'block', name: 'SP', subtype: 'math_number', value: 70},
                    {type: 'block', name: 'DP', subtype: 'math_number', value: 3}
                ]
            }
        };

        /**
         * code generation for set seeder props
         */
        Blockly.JavaScript['sc_set_seeder_props'] = function (block) {
            var tl = Blockly.JavaScript.valueToCode(block, 'TL', Blockly.JavaScript.ORDER_COMMA);
            var bf = Blockly.JavaScript.valueToCode(block, 'BF', Blockly.JavaScript.ORDER_COMMA);
            var bd = Blockly.JavaScript.valueToCode(block, 'BD', Blockly.JavaScript.ORDER_COMMA);
            var sp = Blockly.JavaScript.valueToCode(block, 'SP', Blockly.JavaScript.ORDER_COMMA);
            var dp = Blockly.JavaScript.valueToCode(block, 'DP', Blockly.JavaScript.ORDER_COMMA);
            return 'setSeederProperties(' + tl + ',' + bf + ',' + bd + ',' + sp + ',' + dp + ');\n';
        };

        /**
         * scan - test implementation
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_scan'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_scan', 'message0'),
                    args0: [
                        {
                            type: 'field_dropdown', name: 'BODYTYPE', options: [
                            [Translations.getString('sc_scan', 'op0'), 'Ship'],
                            [Translations.getString('sc_scan', 'op1'), 'Asteroid'],
                            [Translations.getString('sc_scan', 'op2'), 'Planetoid'],
                            [Translations.getString('sc_scan', 'op3'), 'Tree'],
                            [Translations.getString('sc_scan', 'op4'), 'Alien'],
                            [Translations.getString('sc_scan', 'op5'), 'HydraHead']
                        ]
                        }
                    ],
                    output: 'Array',
                    colour: 270
                });
            },
            starcoder: {}
        };

        /**
         * code generation for scan
         *
         * @param block
         * @returns {string}
         */
        Blockly.JavaScript['sc_scan'] = function (block) {
            var bodytype = block.getFieldValue('BODYTYPE');
            return ['localScan("' + bodytype + '")', Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

        Blockly.Blocks['sc_var'] = {
            init: function () {
                this.setColour(90);
                this.appendDummyInput()
                    .appendField(new Blockly.FieldVariable('i'), 'VAR');
                this.setOutput('true');
            }
        };

        Blockly.JavaScript['sc_var'] = function (block) {
            var code = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
            return [code, Blockly.JavaScript.ORDER_NONE];
        };

        Blockly.Blocks['sc_console_log'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_console_log'),
                    args0: [{type: 'input_value', name: 'MSG'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 30
                })
            },
            starcoder: {}
        };

        Blockly.JavaScript['sc_console_log'] = function (block) {
            var msg = Blockly.JavaScript.valueToCode(block, 'MSG', Blockly.JavaScript.ORDER_NONE);
            return 'log(' + msg + ');\n';
        };

        Blockly.Blocks['sc_set_timer'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_set_timer', 'message0'),
                    args0: [
                        {type: 'input_statement', name: 'STATEMENTS'},
                        {type: 'input_value', name: 'TIMEOUT', check: 'Number'}
                    ],
                    message1: Translations.getString('sc_set_timer', 'message1'),
                    args1: [{type: 'field_checkbox', name: 'REPEAT'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 180
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'TIMEOUT', subtype: 'math_number', value: 1}
                ]
            }
        };

        Blockly.JavaScript['sc_set_timer'] = function (block) {
            var timeout = Blockly.JavaScript.valueToCode(block, 'TIMEOUT', Blockly.JavaScript.ORDER_COMMA);
            var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
            var repeat = block.getFieldValue('REPEAT').toLowerCase();
            return 'setTimer(function () {\n' +
                statements +
                '}, ' + timeout + ', ' + repeat + ');\n';
        };

        /**
         * Get property of world body
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_get_body_property'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_get_body_property', 'message0'),
                    args0: [
                        {
                            type: 'field_dropdown', name: 'PROP', options: [
                            [Translations.getString('sc_get_body_property', 'op0'), 'x'],
                            [Translations.getString('sc_get_body_property', 'op1'), 'y'],
                            [Translations.getString('sc_get_body_property', 'op2'), 'vx'],
                            [Translations.getString('sc_get_body_property', 'op3'), 'vy'],
                            [Translations.getString('sc_get_body_property', 'op4'), 'id'],
                            [Translations.getString('sc_get_body_property', 'op5'), 'distance']
                        ]
                        },
                        {type: 'input_value', name: 'BODY'}
                    ],
                    output: null,
                    colour: 120
                })
            },
            starcoder: {}
        };

        /**
         * Code generation for getbody property
         *
         * @param block
         * @returns {*[]}
         */
        Blockly.JavaScript['sc_get_body_property'] = function (block) {
            var prop = block.getFieldValue('PROP');
            var body = Blockly.JavaScript.valueToCode(block, 'BODY', Blockly.JavaScript.ORDER_COMMA);
            return ['getBodyProperty(' + body + ', "' + prop + '")', Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

        /**
         * Sort list of bodies proximity to ship
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_sort_by_distance'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_sort_by_distance', 'message0'),
                    args0: [
                        {type: 'input_value', name: 'BODIES', check: 'Array'},
                        {
                            type: 'field_dropdown', name: 'DIR', options: [
                            [Translations.getString('sc_sort_by_distance', 'op0'), 'false'],
                            [Translations.getString('sc_sort_by_distance', 'op1'), 'true']
                        ]
                        }
                    ],
                    output: 'Array',
                    colour: 240
                })
            },
            starcoder: {}
        };

        /**
         * Code generation for sort by distance
         *
         * @param block
         * @returns {*[]}
         */
        Blockly.JavaScript['sc_sort_by_distance'] = function (block) {
            var bodies = Blockly.JavaScript.valueToCode(block, 'BODIES', Blockly.JavaScript.ORDER_COMMA);
            var dir = block.getFieldValue('DIR');
            return ['sortByDistance(' + bodies + ',' + dir + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };

        Blockly.Blocks['sc_point_to_body'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_point_to_body'),
                    args0: [{type: 'input_value', name: 'BODY'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 180
                })
            },
            starcoder: {}
        };

        Blockly.JavaScript['sc_point_to_body'] = function (block) {
            var body = Blockly.JavaScript.valueToCode(block, 'BODY', Blockly.JavaScript.ORDER_NONE);
            return 'pointToBody(' + body + ');\n';
        };

        /**
         * End event loop and allow code to terminate
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_cancel_event_loop'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_cancel_event_loop'),
                    previousStatement: null,
                    nextStatement: null,
                    colour: 150
                });
            },
            starcoder: {}
        };

        Blockly.JavaScript['sc_cancel_event_loop'] = function (block) {
            return 'cancelEventLoop();\n';
        };

        /**
         * Turn music on
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_music_on'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_music_on'),
                    previousStatement: null,
                    nextStatement: null,
                    colour: 300
                });
            },
            starcoder: {}
        };

        Blockly.JavaScript['sc_music_on'] = function (block) {
            return 'musicOn();\n';
        };

        /**
         * Turn music off
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_music_off'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_music_off'),
                    previousStatement: null,
                    nextStatement: null,
                    colour: 300
                });
            },
            starcoder: {}
        };

        Blockly.JavaScript['sc_music_off'] = function (block) {
            return 'musicOff();\n';
        };

        /**
         * Show grid
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_show_grid'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_show_grid'),
                    previousStatement: null,
                    nextStatement: null,
                    colour: 300
                });
            },
            starcoder: {}
        };

        Blockly.JavaScript['sc_show_grid'] = function (block) {
            return 'showGrid();\n';
        };


        /**
         * Hide grid
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_hide_grid'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_hide_grid'),
                    previousStatement: null,
                    nextStatement: null,
                    colour: 300
                });
            },
            starcoder: {}
        };

        Blockly.JavaScript['sc_hide_grid'] = function (block) {
            return 'hideGrid();\n';
        };

        /**
         * Show short text alert
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_alert'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_alert'),
                    args0: [{type: 'input_value', name: 'VALUE', check: 'String'}],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 160
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'VALUE', subtype: 'text', value: 'Hello universe!'}
                ],
                disabled: true              // Pending better profanity filter
            }
        };

        /**
         * Code generation for alert
         *
         * @param block
         * @returns {string}
         */
        Blockly.JavaScript['sc_alert'] = function (block) {
            var arg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '1';
            return 'alert(' + arg + ');\n';
        };

        /**
         * Create Turret
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_create_turret'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_create_turret'),
                    previousStatement: null,
                    nextStatement: null,
                    colour: 240
                });
            },
            starcoder: {}
        };

        /**
         * Code generation of create turret
         */
        Blockly.JavaScript['sc_create_turret'] = function (block) {
            return 'createTurret();\n';
        };

        /**
         * shoot turret
         */
        Blockly.Blocks['sc_fire_turret'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_fire_turret'),
                    args0: [
                        {type: 'input_value', name: 'TURRET'}
                    ],
                    colour: 210,
                    previousStatement: true,
                    nextStatement: true
                });
            },
            starcoder: {}
        };

        /**
         * code generation for fire turret
         */
        Blockly.JavaScript['sc_fire_turret'] = function (block) {
            var turret = Blockly.JavaScript.valueToCode(block, 'TURRET', Blockly.JavaScript.ORDER_NONE);
            return 'fireTurret(' + turret + ');\n';
        };

        /**
         * aim turret
         */
        Blockly.Blocks['sc_aim_turret'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_aim_turret', 'message0'),
                    message1: Translations.getString('sc_aim_turret', 'message1'),
                    args1: [
                        {type: 'input_value', name: 'TURRET'},
                        {type: 'input_value', name: 'ANGLE', check: 'Number'}
                    ],
                    colour: 210,
                    previousStatement: true,
                    nextStatement: true
                });
            },
            starcoder: {}
        };

        /**
         * code generation for aim turret
         */
        Blockly.JavaScript['sc_aim_turret'] = function (block) {
            var turret = Blockly.JavaScript.valueToCode(block, 'TURRET', Blockly.JavaScript.ORDER_COMMA);
            var angle = Blockly.JavaScript.valueToCode(block, 'ANGLE', Blockly.JavaScript.ORDER_COMMA);
            return 'aimTurret(' + turret + ',' + angle + ');\n';
        };

        /**
         * get turrets created by ship
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_get_turrets'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_get_turrets'),
                    args0: [{type: 'input_value', name: 'VALUE', check: 'Number'}],
                    output: 'Array',
                    colour: 270
                });
            },
            starcoder: {
                defaults: [
                    {type: 'block', name: 'VALUE', subtype: 'math_number', value: 0}
                ]
            }
        };

        /**
         * code generation for get_turrets
         *
         * @param block
         * @returns {string}
         */
        Blockly.JavaScript['sc_get_turrets'] = function (block) {
            var arg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '1';
            //return ['getTurrets("' + arg + '")', Blockly.JavaScript.ORDER_FUNCTION_CALL];
            return ['getTurret(' + arg + ')', Blockly.JavaScript.ORDER_ATOMIC];
        };

        /**
         * Broadcast message to all other players
         *
         * @type {{init: Function}}
         */
        Blockly.Blocks['sc_broadcast'] = {
            init: function () {
                this.jsonInit({
                    message0: Translations.getString('sc_broadcast', 'message0'),
                    args0: [
                        {
                            type: 'field_dropdown', name: 'MSG', options: [
                            [Translations.getString('sc_broadcast', 'op0'), '0'],
                            [Translations.getString('sc_broadcast', 'op1'), '1'],
                            [Translations.getString('sc_broadcast', 'op2'), '2'],
                            [Translations.getString('sc_broadcast', 'op3'), '3'],
                            [Translations.getString('sc_broadcast', 'op4'), '4'],
                        ]
                        }
                    ],
                    output: 'Array',
                    colour: 240
                });
            },
            starcoder: {}
        };
        // Blockly.Blocks['sc_broadcast'] = {
        //     init: function () {
        //         this.jsonInit({
        //             message0: Translations.getString('sc_broadcast', 'message0'),
        //             args0: [
        //                 {
        //                     type: 'field_dropdown', name: 'MSG', options: [
        //                     ["nice job!", '0'],
        //                     ["how did you do that? can you deploy your code?", '1'],
        //                     ["follow me!", '2'],
        //                     ["very cool, any other cool code to share?", '3'],
        //                     ["wow!", '4'],
        //                     ["bom trabalho!", '5'],
        //                     ["como você fez isso? você pode implantar seu código?", '6'],
        //                     ["me siga!", '7'],
        //                     ["muito legal, qualquer outro código legal para compartilhar?", '8'],
        //                     ["Uau!", '9']
        //                 ]
        //                 }
        //             ],
        //             output: 'Array',
        //             colour: 240
        //         });
        //     },
        //     starcoder: {}
        // };

        /**
         * Code generation for broadcast
         *
         * @param block
         * @returns {*[]}
         */
        Blockly.JavaScript['sc_broadcast'] = function (block) {
            let msg = block.getFieldValue('MSG');
            return 'broadcast(' + msg + ')';
        };


        /** Redefinition of standard Blockly blocks */

        Blockly.Blocks['variables_get'] = {
            /**
             * Block for variable getter.
             * @this Blockly.Block
             */
            init: function () {
                this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
                this.setColour(Blockly.Blocks.variables.HUE);
                this.appendDummyInput()
                    .appendField(new Blockly.FieldDropdown(_generateVarNames), 'VAR');
                this.setOutput(true);
                this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
                //this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
            },

            getVars: function () {
                return [this.getFieldValue('VAR')];
            },

            renameVar: function (oldName, newName) {
                if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                    this.setFieldValue(newName, 'VAR');
                }
            }
        };

        Blockly.Blocks['variables_set'] = {
            /**
             * Block for variable setter.
             * @this Blockly.Block
             */
            init: function () {
                this.jsonInit({
                    "message0": Blockly.Msg.VARIABLES_SET,
                    "args0": [
                        {
                            "type": "field_dropdown",
                            "name": "VAR",
                            "options": _generateVarNames()
                        },
                        {
                            "type": "input_value",
                            "name": "VALUE"
                        }
                    ],
                    "previousStatement": null,
                    "nextStatement": null,
                    "colour": Blockly.Blocks.variables.HUE,
                    "tooltip": Blockly.Msg.VARIABLES_SET_TOOLTIP,
                    "helpUrl": Blockly.Msg.VARIABLES_SET_HELPURL
                });
            },

            getVars: function () {
                return [this.getFieldValue('VAR')];
            },

            renameVar: function (oldName, newName) {
                if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                    this.setFieldValue(newName, 'VAR');
                }
            }
        };

        Blockly.Blocks['controls_for'] = {
            init: function () {
                this.jsonInit({
                    "message0": "%{BKY_CONTROLS_FOR_TITLE}",
                    "args0": [
                        {
                            "type": "field_dropdown",
                            "name": "VAR",
                            "options": _generateVarNames()
                        },
                        {
                            "type": "input_value",
                            "name": "FROM",
                            "check": "Number",
                            "align": "RIGHT"
                        },
                        {
                            "type": "input_value",
                            "name": "TO",
                            "check": "Number",
                            "align": "RIGHT"
                        },
                        {
                            "type": "input_value",
                            "name": "BY",
                            "check": "Number",
                            "align": "RIGHT"
                        }
                    ],
                    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
                    "args1": [{
                        "type": "input_statement",
                        "name": "DO"
                    }],
                    "inputsInline": true,
                    "previousStatement": null,
                    "nextStatement": null,
                    "colour": "%{BKY_LOOPS_HUE}",
                    "helpUrl": "%{BKY_CONTROLS_FOR_HELPURL}",
                    "extensions": [
                        "controls_for_tooltip"
                    ]
                });
            },

            getVars: function () {
                return [this.getFieldValue('VAR')];
            },

            renameVar: function (oldName, newName) {
                if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                    this.setFieldValue(newName, 'VAR');
                }
            }
        };

        Blockly.Blocks['controls_forEach'] = {
            init: function () {
                this.jsonInit({
                    "message0": "%{BKY_CONTROLS_FOREACH_TITLE}",
                    "args0": [
                        {
                            "type": "field_dropdown",
                            "name": "VAR",
                            "options": _generateVarNames()
                        },
                        {
                            "type": "input_value",
                            "name": "LIST",
                            "check": "Array"
                        }
                    ],
                    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
                    "args1": [{
                        "type": "input_statement",
                        "name": "DO"
                    }],
                    "previousStatement": null,
                    "nextStatement": null,
                    "colour": "%{BKY_LOOPS_HUE}",
                    "helpUrl": "%{BKY_CONTROLS_FOREACH_HELPURL}",
                    "extensions": ["controls_forEach_tooltip"]
                });
            },

            getVars: function () {
                return [this.getFieldValue('VAR')];
            },

            renameVar: function (oldName, newName) {
                if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                    this.setFieldValue(newName, 'VAR');
                }
            }
        };

        Blockly.Blocks['math_change'] = {
            init: function () {
                this.jsonInit({
                    "message0": "%{BKY_MATH_CHANGE_TITLE}",
                    "args0": [
                        {
                            "type": "field_dropdown",
                            "name": "VAR",
                            "options": _generateVarNames()
                        },
                        {
                            "type": "input_value",
                            "name": "DELTA",
                            "check": "Number"
                        }
                    ],
                    "previousStatement": null,
                    "nextStatement": null,
                    "colour": "%{BKY_VARIABLES_HUE}",
                    "helpUrl": "%{BKY_MATH_CHANGE_HELPURL}",
                    "extensions": ["math_change_tooltip"]
                });
            },

            getVars: function () {
                return [this.getFieldValue('VAR')];
            },

            renameVar: function (oldName, newName) {
                if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                    this.setFieldValue(newName, 'VAR');
                }
            }
        };

        Blockly.Blocks['delim_text'] = {
            init: function () {
                this.jsonInit({
                    "message0": "%1",
                    "args0": [{
                        "type": "field_dropdown",
                        "name": "TEXT",
                        "options": [
                            [",", ","],
                            ["-", "-"],
                            ["/", "/"],
                            [".", "."],
                            ["(space)", " "],
                            ["(empty string)"]
                        ]
                    }],
                    "output": "String",
                    "colour": "%{BKY_TEXTS_HUE}",
                    "helpUrl": "%{BKY_TEXT_TEXT_HELPURL}",
                    "tooltip": "%{BKY_TEXT_TEXT_TOOLTIP}",
                    "extensions": [
                        "text_quotes",
                        "parent_tooltip_when_inline"
                    ]
                });
            }
        };
        Blockly.JavaScript['delim_text'] = Blockly.JavaScript['text'];
    },

    /**
     * Automagically create xml dom for Starcoder Blockly blocks
     * TBD: Smarter categories and sorting
     *
     * @param xml
     */
    addStarcoderBlocks: function (xml) {
        var maincat = document.createElement('category');
        maincat.setAttribute('name', 'Starcoder');
        for (var k in Blockly.Blocks) {
            var proto = Blockly.Blocks[k];
            var sc = proto.starcoder;
            if (sc && !sc.disabled) {
                var el = document.createElement('block');
                el.setAttribute('type', k);
                var defaults = sc.defaults || [];
                for (var i = 0, l = defaults.length; i < l; i++) {
                    addChildValue(el, defaults[i]);
                }
                maincat.appendChild(el);
            }
        }
        xml.insertBefore(maincat, xml.firstChild);
    }
};

var blockToField = {
    'math_number': 'NUM',
    'text': 'TEXT'
};
function addChildValue (el, desc) {
    var val, block, field, text, fieldname;
    switch (desc.type) {
        case 'block':
        case 'shadow':
            val = document.createElement('value');
            val.setAttribute('name', desc.name);
            block = document.createElement(desc.type);
            block.setAttribute('type', desc.subtype);
            fieldname = desc.fieldname || blockToField[desc.subtype];
            field = document.createElement('field');
            field.setAttribute('name', fieldname);
            text = document.createTextNode(desc.value);
            field.appendChild(text);
            block.appendChild(field);
            val.appendChild(block);
            el.appendChild(val);
            break;
        case 'field':
            // TODO
            break;
    }
}

var _stdVarNames = ['i', 'j', 'k', 'n', 'x', 'y'];
var _baseVarNames= ['var', 'item', 'list'];
var _numVarsPerName = 5;
/**
 * Generate list of allowed variable names
 * @return {array}
 * @private
 */
var _generateVarNames = function () {
    var options = [];
    for (var i = 0; i < _stdVarNames.length; i++) {
        options.push([_stdVarNames[i], _stdVarNames[i]]);
    }
    for (i = 0; i < _baseVarNames.length; i++) {
        for (var j = 1; j <= _numVarsPerName; j++) {
            options.push([_baseVarNames[i] + j, _baseVarNames[i] + j]);
        }
    }
    return options;
};

var _stdFunNames = ['start', 'finish', 'main', 'mainloop'];
var _baseFunNames= ['f', 'func', 'function', 'proc', 'procedure', 'subroutine', 'task'];
var _numFunsPerName = 5;
/**
 * Generate list of allowed function names
 * @return {array}
 * @private
 */
var _generateFunNames = function () {
    var options = [];
    for (var i = 0; i < _stdFunNames.length; i++) {
        options.push([_stdFunNames[i], _stdFunNames[i]]);
    }
    for (i = 0; i < _baseFunNames.length; i++) {
        for (var j = 1; j <= _numFunsPerName; j++) {
            options.push([_baseFunNames[i] + j, _baseFunNames[i] + j]);
        }
    }
    return options;
};

/**
 * Monkey patch of code generation to handle whitelisted variables
 */
Blockly.JavaScript.workspaceToCode = function (workspace) {
    if (!workspace) {
        // Backwards compatibility from before there could be multiple workspaces.
        console.warn('No workspace specified in workspaceToCode call.  Guessing.');
        workspace = Blockly.getMainWorkspace();
    }
    var code = [];
    this.init(workspace);
    var blocks = workspace.getTopBlocks(true);
    for (var x = 0, block; block = blocks[x]; x++) {
        var line = this.blockToCode(block);
        if (goog.isArray(line)) {
            // Value blocks return tuples of code and operator order.
            // Top-level blocks don't care about operator order.
            line = line[0];
        }
        if (line) {
            if (block.outputConnection && this.scrubNakedValue) {
                // This block is a naked value.  Ask the language's code generator if
                // it wants to append a semicolon, or something.
                line = this.scrubNakedValue(line);
            }
            code.push(line);
        }
    }
    code = code.join('\n');  // Blank line between each section.
    // Patch here
    let allblocks = workspace.getAllBlocks();
    let variables = {};
    for (let i = 0; i < allblocks.length; i++) {
        let vars = allblocks[i].getVars();
        for (let j = 0; j < vars.length; j++) {
            variables[vars[j]] = true;
        }
    }
    let varnames = Object.keys(variables);
    if (varnames.length) {
        Blockly.JavaScript.definitions_['variables'] = 'var ' + varnames.join(', ') + ';';
    }
    // end patch
    code = this.finish(code);
    // Final scrubbing of whitespace.
    code = code.replace(/^\s+\n/, '');
    code = code.replace(/\n\s+$/, '\n');
    code = code.replace(/[ \t]+\n/g, '\n');
    return code;
};