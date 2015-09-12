/**
 * Created by jay on 9/12/15.
 */
'use strict';

module.exports = {
    init: function () {
        var self = this;
        this.codeWindowMode = 'blockly';
        this.blocklyWorkspace = Blockly.inject('blockly', {toolbox: document.getElementById('toolbox')});
        //var button = $('#send-code');
        this.aceEditor = ace.edit('aceeditor');
        var JavaScriptMode = ace.require("ace/mode/javascript").Mode;
        this.aceEditor.getSession().setMode(new JavaScriptMode());
        this.aceEditor.setTheme("ace/theme/twilight");

        $('button').button();
        $('select').selectmenu();

        $('#tabs').tabs({
            activate: function (event, ui) {
                if (ui.oldPanel.is('#blockly')) {
                    $('.blocklyToolboxDiv').hide();
                    self.aceEditor.resize();
                    self.codeWindowMode = 'ace';
                } else {
                    Blockly.svgResize(self.blocklyWorkspace);
                    $('.blocklyToolboxDiv').show();
                    self.codeWindowMode = 'blockly';
                }
            }

        });

        this.blocklyWorkspace.addChangeListener(function () {
            //code = Blockly.JavaScript.workspaceToCode(workspace);
            self.aceEditor.setValue(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
        });

        $('#send-code').on('click', function () {
            if (self.codeWindowMode === 'blockly') {
                self.sendCode(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
            } else {
                self.sendCode(self.aceEditor.getValue());
            }
        });
        this.toggleCodeWindow(false)
    },

    toggleCodeWindow: function (state) {
        if (typeof state !== 'boolean') {
            this.codeWindowState = !this.codeWindowState;
        } else {
            this.codeWindowState = state;
        }
        console.log('tog', this.codeWindowState);
        if (this.codeWindowState) {
            $('#code-window').show();
            $('.blocklyToolboxDiv').show();
            if (this.codeWindowMode === 'blockly') {
                Blockly.svgResize(this.blocklyWorkspace);
            } else if (this.codeWindowMode === 'ace') {
                this.aceEditor.resize();
            }
        } else {
            $('#code-window').hide();
            $('.blocklyToolboxDiv').hide();
        }
    }
};