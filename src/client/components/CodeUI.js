/**
 * Created by jay on 9/12/15.
 */
'use strict';

//var BlocklyAPI = require('./BlocklyAPI.js');

module.exports = {
    init: function () {
        var self = this;
        this.codeWindowMode = 'blockly';
        this.old_codeWindowMode = '';
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
                if (ui.newPanel.is('#aceeditor')) {
                //if (ui.oldPanel.is('#blockly')) {
                    $('.blocklyToolboxDiv').hide();
                    //self.aceEditor.setValue(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
                    self.aceEditor.resize();
                    self.old_codeWindowMode = self.codeWindowMode;
                    self.codeWindowMode = 'ace';
                } else if (ui.newPanel.is('#blockly')) {
                    Blockly.svgResize(self.blocklyWorkspace);
                    $('.blocklyToolboxDiv').show();
                    self.old_codeWindowMode = self.codeWindowMode;
                    self.codeWindowMode = 'blockly';
                } else if (ui.newPanel.is('#samples')) {
                    $('.blocklyToolboxDiv').hide();
                    self.old_codeWindowMode = self.codeWindowMode;
                    self.codeWindowMode = 'samples';
                }
            }

        });

        this.blocklyWorkspace.addChangeListener(function () {
            //console.log("current mode " + self.codeWindowMode);
            //console.log("old mode " + self.old_codeWindowMode);
                //code = Blockly.JavaScript.workspaceToCode(workspace);
            if (self.old_codeWindowMode !== 'samples' && self.codeWindowMode !== 'editor') {
                self.aceEditor.setValue(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
                //console.log("changelistener");
            }

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
        $('#load-ex7').on('dblclick', function () {
            self.sendCodeMessage('load', "example7");
        });
        $('#load-ex8').on('dblclick', function () {
            self.sendCodeMessage('load', "example8");
        });
        $('#load-ex9').on('dblclick', function () {
            self.sendCodeMessage('load', "example9");
        });
        $('#load-ex10').on('dblclick', function () {
            self.sendCodeMessage('load', "example10");
        });
        $('#load-ex11').on('dblclick', function () {
            self.sendCodeMessage('load', "example11");
        });
        $('#load-ex12').on('dblclick', function () {
            self.sendCodeMessage('load', "example12");
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
        //console.log(self);
        if (typeof state !== 'boolean') {
            this.codeWindowState = !this.codeWindowState;
        } else {
            this.codeWindowState = state;
        }
        if (this.codeWindowState) {
            // Shrink video window
            if (this.game.vidplayer && this.game.vidplayer.visible) {
                this.game.vidplayer.shrink();
                this.codeUIShrink();
            }
            $('#code-window').show(function () {
                //this.starcoder.sendMessage(self.player, 'shipinvulnerable');
                Blockly.svgResize(self.blocklyWorkspace);
                //var ship = self.player.getShip();
                //ship.invulnerable = true;
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
            if (this.game.vidplayer && this.game.vidplayer.visible) {
                this.game.vidplayer.grow();
            }
            this.codeUIGrow();
            $('#code-window').hide();
            $('.blocklyToolboxDiv').hide();
            if (this.game.input) {
                this.game.input.keyboard.enabled = true;
            }
            //var ship = self.player.getShip();
            //ship.invulnerable = true;
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
    },

    codeUIShrink: function () {
        $('#code-window').css("transform", "scale(0.65) translateX(-40%)");
    },

    codeUIGrow: function () {
        $('#code-window').css("transform", "");
    }
};