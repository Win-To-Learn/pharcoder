/**
 * BlocklyCustom.js
 *
 * Definitions and code generation for StarCoder oriented blocks
 */
'use strict';

/**
 * Set scale of player ship
 * @type {{init: Function}}
 */
Blockly.Blocks['sc_set_scale'] = {
    init: function () {
        this.jsonInit({
            message0: 'set ship scale to %1',
            args0: [{type: 'input_value', name: 'VALUE', check: 'Number'}],
            previousStatement: null,
            nextStatement: null,
            colour: 160
        });
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

/**
 * Block representing an ordered pair of coordinates
 */
Blockly.Blocks['sc_pair'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('(')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'X')
            .appendField(',')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'Y')
            .appendField(')');
        this.setColour(160);
        this.setNextStatement(true, 'Pair');
        this.setPreviousStatement(true, 'Pair');
    }
};

/**
 * Code generation for pair is a NOOP bc it has no meaning outside of a container
 */
Blockly.JavaScript['sc_pair'] = function (block) {
    return null;
};

/**
 * Block representing a set of ordered pairs to be used as the player's shape
 */
Blockly.Blocks['sc_change_shape'] = {
    init: function () {
        this.jsonInit({
            message0: 'set ship shape %1',
            args0: [{type: 'input_statement', name: 'PAIRS', check: 'Pair'}],
            previousStatement: null,
            nextStatement: null,
            colour: 300
        });
    }
};

/**
 * Generate code for ordered pair blocks
 * Bypass normal Blockly code generation methods bc our pair values are
 * 'statements' in Blockly-speak
 */
Blockly.JavaScript['sc_change_shape'] = function (block) {
    var x, y;
    var pairList = [];
    var pairBlock = block.getInputTargetBlock('PAIRS');
    while (pairBlock) {
        if (pairBlock.type === 'sc_pair') {
            x = pairBlock.getFieldValue('X');
            y = pairBlock.getFieldValue('Y');
        } else {
            x = Blockly.JavaScript.valueToCode(pairBlock, 'X', Blockly.JavaScript.ORDER_COMMA) || '0';
            y = Blockly.JavaScript.valueToCode(pairBlock, 'Y', Blockly.JavaScript.ORDER_COMMA) || '0';
        }
        pairList.push('[' + x + ',' + y + ']');
        pairBlock = pairBlock.nextConnection && pairBlock.nextConnection.targetBlock();
    }
    if (pairList.length > 2) {
        // Don't generate code for fewer than 3 points
        return 'changeShipShape([' + pairList.join(',') + ']);\n';
    }
    return null;
};

/**
 * set ship thrust power
 * @type {{init: Function}}
 */
Blockly.Blocks['sc_set_thrust_power'] = {
    init: function () {
        this.jsonInit({
            message0: 'set ship thrust force to %1',
            args0: [{type: 'input_value', name: 'VALUE', check: 'Number'}],
            previousStatement: null,
            nextStatement: null,
            colour: 160
        });
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
 * set ship color
 */
Blockly.Blocks['sc_set_color'] = {
    init: function () {
        this.jsonInit({
            message0: 'set ship color %1',
            args0: [{type: 'field_colour', name: 'COLOR', colour: '#ff0000'}],
            previousStatement: null,
            nextStatement: null,
            colour: 30
        });
    }
};

/**
 * code generation for set color
 */
Blockly.JavaScript['sc_set_color'] = function (block) {
    var color = block.getFieldValue('COLOR');
    return 'changeShipColor(\'' + color + '\');\n';
};

/**
 * translate ship to new position
 */
Blockly.Blocks['sc_translate'] = {
    init: function () {
        this.setColour(240);
        this.appendDummyInput()
            .appendField('x')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'X')
            .appendField('y')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'Y');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

/**
 * code generation for ship translation
 */
Blockly.JavaScript['sc_translate'] = function (block) {
    var x = block.getFieldValue('X');
    var y = block.getFieldValue('Y');
    return 'translate(' + x + ',' + y + ');\n';
};

/**
 * shoot ship's weapon
 */
Blockly.Blocks['sc_shoot'] = {
    init: function () {
        this.jsonInit({
            message0: 'shoot laser',
            previousStatement: null,
            nextStatement: null,
            colour: 180
        });
    }
};

/**
 * code generation for shoot
 */
Blockly.JavaScript['sc_shoot'] = function () {
    return 'shoot();\n';
};

/**
 * set seeder (tree default) properties
 */
Blockly.Blocks['sc_set_seeder_props'] = {
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField('set tree seeder properties');
        this.appendDummyInput()
            .appendField('trunk length')
            .appendField(new Blockly.FieldTextInput('1', Blockly.FieldTextInput.numberValidator), 'TL');
        this.appendDummyInput()
            .appendField('branch factor')
            .appendField(new Blockly.FieldTextInput('4', Blockly.FieldTextInput.numberValidator), 'BF');
        this.appendDummyInput()
            .appendField('branch decay')
            .appendField(new Blockly.FieldTextInput('0.75', Blockly.FieldTextInput.numberValidator), 'BD');
        this.appendDummyInput()
            .appendField('spread')
            .appendField(new Blockly.FieldTextInput('90', Blockly.FieldTextInput.numberValidator), 'SP');
        this.appendDummyInput()
            .appendField('depth')
            .appendField(new Blockly.FieldTextInput('5', Blockly.FieldTextInput.numberValidator), 'DP');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

/**
 * code generation for set seeder props
 */
Blockly.JavaScript['sc_set_seeder_props'] = function (block) {
    var tl = block.getFieldValue('TL');
    var bf = block.getFieldValue('BF');
    var bd = block.getFieldValue('BD');
    var sp = block.getFieldValue('SP');
    var dp = block.getFieldValue('DP');
    return 'setSeederProperties(' + tl + ',' + bf + ',' + bd + ',' + sp + ',' + dp + ');\n';
};

/**
 * scan - test implementation
 *
 * @type {{init: Function}}
 */
//Blockly.Blocks['sc_scan'] = {
//    init: function () {
//        this.setColour(270);
//        this.appendDummyInput()
//            .appendField('scan');
//        this.setOutput(true, 'Array');
//    }
//};
Blockly.Blocks['sc_scan'] = {
    init: function () {
        this.jsonInit({
            message0: 'scan of %1 nearby',
            args0: [
                {type: 'field_dropdown', name: 'BODYTYPE', options: [
                    ['other ships', 'Ship'],
                    ['asteroids', 'Asteroid'],
                    ['planetoids', 'Planetoid'],
                    ['trees', 'Trees']
                ]}
            ],
            output: 'Array',
            colour: 270
        });
    }
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
            message0: 'log %1 to server console',
            args0: [{type: 'input_value', name: 'MSG'}],
            previousStatement: null,
            nextStatement: null,
            colour: 30
        })
    }
};

Blockly.JavaScript['sc_console_log'] = function (block) {
    var msg = Blockly.JavaScript.valueToCode(block, 'MSG', Blockly.JavaScript.ORDER_NONE);
    return 'log(' + msg + ');\n';
};

//Blockly.Blocks['sc_set_timer'] = {
//    init: function () {
//        this.setColour(180);
//        this.appendDummyInput()
//            .appendField('set timer');
//        this.appendValueInput('TIMEOUT');
//        this.appendStatementInput('STATEMENTS');
//        this.setPreviousStatement(true);
//        this.setNextStatement(true);
//    }
//};

Blockly.Blocks['sc_set_timer'] = {
    init: function () {
        this.jsonInit({
            message0: 'do %1 in %2 seconds',
            args0: [
                {type: 'input_statement', name: 'STATEMENTS'},
                {type: 'input_value', name: 'TIMEOUT', check: 'Number'}
            ],
            message1: 'repeat %1',
            args1: [{type: 'field_checkbox', name: 'REPEAT'}],
            previousStatement: null,
            nextStatement: null,
            colour: 180
        });
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
            message0: '%1 of %2',
            args0: [
                {type: 'field_dropdown', name: 'PROP', options: [
                    ['x coordinate', 'x'],
                    ['y coordinate', 'y'],
                    ['velocity in x direction', 'vx'],
                    ['velocity in y direction', 'vy'],
                    ['id', 'id'],
                    ['distance from ship', 'distance']
                ]},
                {type: 'input_value', name: 'BODY'}
            ],
            output: null,
            colour: 120
        })
    }
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
            message0: 'sort %1 by distance from ship %2',
            args0: [
                {type: 'input_value', name: 'BODIES', check:'Array'},
                {type: 'field_dropdown', name: 'DIR', options: [
                    ['near to far', 'false'],
                    ['far to near', 'true']
                ]}
            ],
            output: 'Array',
            colour: 240
        })
    }
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
    return ['sortByDistance(' + bodies + ','+ dir + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['sc_point_to_body'] = {
    init: function () {
        this.jsonInit({
            message0: 'point ship at %1',
            args0: [{type: 'input_value', name: 'BODY'}],
            previousStatement: null,
            nextStatement: null,
            colour: 180
        })
    }
};

Blockly.JavaScript['sc_point_to_body'] = function (block) {
    var body = Blockly.JavaScript.valueToCode(block, 'BODY', Blockly.JavaScript.ORDER_NONE);
    return 'pointToBody(' + body + ');\n';
};

/**
 * End event loop and allow interpreter to terminate
 *
 * @type {{init: Function}}
 */
Blockly.Blocks['sc_cancel_event_loop'] = {
    init: function () {
        this.jsonInit({
            message0: 'cancel event loop',
            previousStatement: null,
            nextStatement: null,
            colour: 150
        });
    }
};

Blockly.JavaScript['sc_cancel_event_loop'] = function (block) {
    return 'cancelEventLoop();\n';
};