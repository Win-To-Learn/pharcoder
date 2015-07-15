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
    var arg = block.getFieldValue('VALUE');
    return 'setScale(' + arg + ')';
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
        return 'changeShape([' + pairList.join(',') + '])';
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
    var arg = block.getFieldValue('VALUE');
    return 'setThrustForce(' + arg + ')';
};

/**
 * create new planet
 */
Blockly.Blocks['sc_new_planet'] = {
    init: function () {
        this.setColour(120);
        this.appendDummyInput()
            .appendField('new planet');
        this.appendDummyInput()
            .appendField('x')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'X')
            .appendField('y')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'Y');
        this.appendDummyInput()
            .appendField('scale')
            .appendField(new Blockly.FieldTextInput('2', Blockly.FieldTextInput.numberValidator), 'SCALE');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

/**
 * code generation for new planet
 */
Blockly.JavaScript['sc_new_planet'] = function (block) {
    var x = block.getFieldValue('X');
    var y = block.getFieldValue('Y');
    var scale = block.getFieldValue('SCALE');
    return 'newPlanet(' + x + ',' + y + ',' + scale + ')';
};

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
    return 'changeColor(\'' + color + '\')';
};