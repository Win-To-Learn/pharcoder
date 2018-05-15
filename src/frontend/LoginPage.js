/**
 * Created by jay on 9/6/15.
 */

var LoginPage = function (config) {
    this.config = config;

    this.$msg = $('#login-dialog .message');

    for (var i = 1; i <= 2; i++) {
        var tags = this.config.gamerTags[i];
        for (var j = 0, l = tags.length; j < l; j++) {
            $('#gt' + i).append('<option>' + tags[j] + '</option>');
        }
    }

    // add local option for testing if running on localhost
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        $('#server1').prepend('<option value="local">Local</option>');
        $('#server2').prepend('<option value="local">Local</option>');
    }

    $('.select').selectmenu();
    $('.loginbutton').button({icons: {primary: 'ui-icon-triangle-1-e'}});
    $('.accordion').accordion({active: 1, heightStyle: 'content'});
    $('input[checkbox]').button();

    var self = this;
    $('#guestlogin').click(function () {
        self.doLogin({
            server: $('#server2').val(),
            tag: $('#gt1').val() + ' ' + $('#gt2').val(),
            tutorial: $('#tutorial3').is(':checked')
        });
    });
    $('#userlogin').click(function () {
        self.doLogin({
            login: true,
            server: $('#server1').val(),
            user: $('#username').val(),
            pass: $('#password').val(),
            tutorial: $('#tutorial3').is(':checked')
        });
    });
    $('#userreg').click(function () {
        self.doLogin({
            code: $('#regcode').val(),
            user: $('#username-reg').val(),
            pass: $('#password-reg').val(),
            tutorial: $('#tutorial3').is(':checked')
        });
    });
};

LoginPage.prototype.doLogin = function (data) {
    if (!data.tag && (data.user.length === 0 || data.pass.length === 0)) {
        this.setLoginError('Please enter a username and password');
    } else {
        $.ajax({
            url: '/api/login',
            type: 'POST',
            data: data,
            //contentType: 'application/json',
            context: this,
            success: this.loginSuccess,
            error: this.loginError
        });
    }
};

LoginPage.prototype.loginSuccess = function (data, status) {
    // if (data.server) {
    //     window.location.assign(data.server + '/' + data.goto);
    // } else {
    window.location.assign(data.goto);
    //}
};

LoginPage.prototype.loginError = function (jq, status, httpError) {
    if (status === 'error' && httpError === 'Unauthorized') {
        this.setLoginError('Wrong username or password');
    } else {
        this.setLoginError('There was a problem reaching the server. Please try again later.');
    }
};

LoginPage.prototype.setLoginError = function (error) {
    if (!error) {
        this.$msg.hide();
    } else {
        this.$msg.html(error);
        this.$msg.show();
    }
};

module.exports = LoginPage;