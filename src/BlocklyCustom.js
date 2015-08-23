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
        this.setColour(160);
        this.appendValueInput('VALUE')
            .setCheck('Number')
            .appendField('set ship scale');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
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
        this.setColour(300);
        this.appendDummyInput()
            .appendField('player shape');
        this.appendStatementInput('PAIRS')
            .setCheck('Pair');
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
        this.setColour(160);
        this.appendValueInput('VALUE')
            .setCheck('Number')
            .appendField('set ship thrust force');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
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
        this.setColour(30);
        this.appendDummyInput()
            .appendField('ship color')
            .appendField(new Blockly.FieldColour('#ff0000'), 'COLOR');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
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
}

/**
 * shoot ship's weapon
 */
Blockly.Blocks['sc_shoot'] = {
    init: function () {
        this.setColour(180);
        this.appendDummyInput()
            .appendField('shoot');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
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
Blockly.Blocks['sc_scan'] = {
    init: function () {
        this.setColour(270);
        this.appendDummyInput()
            .appendField('scan');
        this.setOutput(true, 'Array');
    }
};

/**
 * code generation for scan
 *
 * @param block
 * @returns {string}
 */
Blockly.JavaScript['sc_scan'] = function (block) {
    return ['localScan()', Blockly.JavaScript.ORDER_NONE];
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
        this.setColour(60);
        this.appendDummyInput()
            .appendField('log to server console');
        this.appendValueInput('VAL');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

Blockly.JavaScript['sc_console_log'] = function (block) {
    var v = Blockly.JavaScript.valueToCode(block, 'VAL', Blockly.JavaScript.ORDER_NONE);
    return 'log(' + v + ');\n';
};

Blockly.Blocks['sc_set_timer'] = {
    init: function () {
        this.setColour(180);
        this.appendDummyInput()
            .appendField('set timer');
        this.appendValueInput('TIMEOUT');
        this.appendStatementInput('STATEMENTS');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

Blockly.JavaScript['sc_set_timer'] = function (block) {
    var timeout = Blockly.JavaScript.valueToCode(block, 'TIMEOUT', Blockly.JavaScript.ORDER_COMMA);
    var statements = Blockly.JavaScript.statementToCode(block,'STATEMENTS');
    return 'setTimer(function () {\n' +
            statements +
            '}, ' + timeout + ');\n';
};