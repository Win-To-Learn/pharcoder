/**
 * BlocklyCustom.js
 *
 * Definitions and code generation for StarCoder oriented blocks
 */
'use strict';

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

Blockly.JavaScript['sc_set_scale'] = function (block) {
    var arg = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE);
    return 'setScale(' + arg + ')';
};

