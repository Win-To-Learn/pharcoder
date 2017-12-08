/**
 * Created by jay on 9/12/15.
 */
'use strict';

//var BlocklyAPI = require('./BlocklyAPI.js');

module.exports = {
    init: function () {
        var self = this;
        this.codeWindowMode = 'blockly';
        this.codeLabelCache = {};
        this.pendingBlocklyCode = null;
        var xml = document.getElementById('toolbox');
        //BlocklyAPI.addStarcoderBlocks(xml);
        this.addStarcoderBlocks(xml);
        this.blocklyWorkspace = Blockly.inject('blockly', {toolbox: xml, comments: false});
        Blockly.svgResize(self.blocklyWorkspace);
        //var button = $('#send-code');
        this.aceEditor = ace.edit('aceeditor');
        var JavaScriptMode = ace.require("ace/mode/javascript").Mode;
        this.aceEditor.getSession().setMode(new JavaScriptMode());
        this.aceEditor.setTheme("ace/theme/twilight");

        $('button').button();
        //$('#select-code').selectmenu({position: {within: '#code-window'}});
        $('#select-code').selectmenu({
            position: {my: "left bottom", at: "left top"},
            classes: {"ui-selectmenu-button-open": "ui-corner-bottom", "ui-menu": "ui-front"}
            });
        $('#select-code').selectmenu("menuWidget").addClass('ui-corner-top').removeClass('ui-corner-bottom');

        $('#sample-accordion').accordion();

        $('#tabs').tabs({
            activate: function (event, ui) {
                if (ui.oldPanel.is('#blockly')) {
                    $('.blocklyToolboxDiv').hide();
                    //self.aceEditor.setValue(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
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
			self.game.sounds.chime.play();
            //self.toggleCodeWindow(false);
            if (self.codeWindowMode === 'blockly') {
                self.sendCodeMessage('exec', Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
            } else {
                self.sendCodeMessage('exec', self.aceEditor.getValue());
            }
        });

        $('#save-code').on('click', function () {

            var label = $('#code-name').val();
            if (label.length) {
                if (self.codeWindowMode === 'blockly') {
                    // Blockly mode - send XML rep of blocks
                    var xml = Blockly.Xml.workspaceToDom(self.blocklyWorkspace);
                    var xml_text = Blockly.Xml.domToText(xml);
                    self.sendCodeMessage('save', {label: label, blockly: xml_text});
                } else {
                    self.sendCodeMessage('save', {label: label, js: self.aceEditor.getValue()});
                }
                $('#code-name').val('');
            }
            
        });
        $('#load-ex1').on('dblclick', function () {
            self.sendCodeMessage('load', "example1");
        });
        $('#load-ex2').on('dblclick', function () {
            self.sendCodeMessage('load', "example2");
        });
        $('#load-ex3').on('dblclick', function () {
            self.sendCodeMessage('load', "example3");
        });
        $('#load-ex4').on('dblclick', function () {
            self.sendCodeMessage('load', "example4");
        });
        $('#load-ex5').on('dblclick', function () {
            self.sendCodeMessage('load', "example5");
        });
        $('#load-ex6').on('dblclick', function () {
            self.sendCodeMessage('load', "example6");
        });
        $('#load-code').on('click', function () {
            var op = $('#select-code option:selected');
            if (op.index() > 0) {
                self.sendCodeMessage('load', op.text());
            }
        });
        $('#deploy-code').on('click', function () {
            if (self.codeWindowMode === 'blockly') {
                // Blockly mode - send XML rep of blocks
                var xml = Blockly.Xml.workspaceToDom(self.blocklyWorkspace);
                var xml_text = Blockly.Xml.domToText(xml);
                self.sendCodeMessage('deploy', {blockly: xml_text});
            } else {
                //self.sendCodeMessage('deploy', {js: self.aceEditor.getValue()});
            }
        });
        this.toggleCodeWindow(false)
    },

    toggleCodeWindow: function (state) {
        var self = this;
        if (typeof state !== 'boolean') {
            this.codeWindowState = !this.codeWindowState;
        } else {
            this.codeWindowState = state;
        }
        if (this.codeWindowState) {
            $('#code-window').show(function () {
                Blockly.svgResize(self.blocklyWorkspace);
                //this.aceEditor.resize();
            });
            if (this.codeWindowMode === 'blockly') {
                $('.blocklyToolboxDiv').show();
                Blockly.svgResize(this.blocklyWorkspace);
            } //else if (this.codeWindowMode === 'ace') {
            //    this.aceEditor.resize();
            //}
            if (this.pendingBlocklyCode) {
                this.setCodeForUI(this.pendingBlocklyCode);
            }
            this.pendingBlocklyCode = null;
            this.game.input.keyboard.enabled = false;
        } else {
            $('#code-window').hide();
            $('.blocklyToolboxDiv').hide();
            if (this.game.input) {
                this.game.input.keyboard.enabled = true;
            }
        }
    },

    addCodeLabel: function (label) {
        if (this.codeLabelCache[label] || label.length < 1) {
            return;
        }
        $('#select-code').append('<option>' + label + '</option>').selectmenu('refresh');
    },

    setCodeForUI: function (code) {
        $('#code-name').val(code.label);
        if (code.blockly) {
            if (this.codeWindowState) {
                $('#tabs').tabs('option', 'active', 0);
                this.blocklyWorkspace.clear();
                var xml = Blockly.Xml.textToDom(code.blockly);
                Blockly.Xml.domToWorkspace(this.blocklyWorkspace, xml);
                //var topBlocks = this.blocklyWorkspaceSvg.getTopBlocks(true);
                //console.log(topBlocks);
                //this.blocklyWorkspaceSvg.cleanUp();
                this.aceEditor.setValue(Blockly.JavaScript.workspaceToCode(this.blocklyWorkspace));
            } else {
                this.pendingBlocklyCode = code;
            }
        } else {
            this.blocklyWorkspace.clear();
            this.aceEditor.setValue(code.js);
            $('#tabs').tabs('option', 'active', 1);
        }
    }
};