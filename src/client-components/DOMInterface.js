/**
 * DOMInterface.js
 *
 * Handle DOM configuration/interaction, i.e. non-Phaser stuff
 */
'use strict';

var DOMInterface = function () {};

DOMInterface.prototype.initDOMInterface = function () {
    var self = this;
    this.dom = {};              // namespace
    this.dom.codeButton = $('#code-btn');
    this.dom.codePopup = $('#code-popup');
    this.dom.loginPopup= $('#login');
    this.dom.loginButton = $('#submit');

    this.dom.codeButton.on('click', function () {
        self.dom.codePopup.toggle('slow');
    });

    $(window).on('message', function (event) {
        if (event.source === self.dom.codePopup.contentWindow) {
            self.sendCode(event.data);
        }
    });

    //this.dom.codePopup.hide();
    for (var i = 1; i <= 2; i++) {
        var tags = this.config.gamerTags[i];
        for (var j = 0, l = tags.length; j < l; j++) {
            $('#gt' + i).append('<option>' + tags[j] + '</option>');
        }
    }
    $('.select').selectmenu();
    $('.loginbutton').button({icons: {primary: 'ui-icon-triangle-1-e'}});

    $('.accordion').accordion({heightStyle: 'content'});
    $('.popup').hide();

};

/**
 * Show login box and wire up handlers
 */
DOMInterface.prototype.showLogin = function () {
    var self = this;
    $('#login-window .message').hide();
    $('#login-window').show().position({my: 'center', at: 'center', of: window});
    $('#userlogin').on('click', function () {
        self.serverLogin($('#username').val(), $('#password').val());
    });
    $('#guestlogin').on('click', function () {
        self.serverLogin($('#gt1').val() + ' ' + $('#gt2').val());
    });
};

DOMInterface.prototype.setLoginError = function (error) {
    var msg = $('#login-window .message');
    if (!error) {
        msg.hide();
    } else {
        msg.html(error);
        msg.show();
    }
};

DOMInterface.prototype.hideLogin = function () {
    $('#login-window').hide();
};

module.exports = DOMInterface;
