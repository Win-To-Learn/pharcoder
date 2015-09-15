/**
 * Created by jay on 9/6/15.
 */

var RegisterPage = function (config) {
    this.config = config;

    this.$msg = $('#register-dialog .message');

    //for (var i = 1; i <= 2; i++) {
    //    var tags = this.config.gamerTags[i];
    //    for (var j = 0, l = tags.length; j < l; j++) {
    //        $('#gt' + i).append('<option>' + tags[j] + '</option>');
    //    }
    //}

    //$('.select').selectmenu();
    //$('.loginbutton').button({icons: {primary: 'ui-icon-triangle-1-e'}});
    $('.accordion').accordion({heightStyle: 'content'});
    $('#userregister').button({icons: {primary: 'ui-icon-triangle-1-e'}});

    var self = this;
    $('#userregister').click(function () {
        self.doRegister({
            user: $('#username').val(),
            pass: $('#password').val()
        });
    });
};


RegisterPage.prototype.doRegister = function (data) {
    if (data.user.length === 0 || data.pass.length === 0) {
        this.setLoginError('Please enter a username and password');
    } else {
        $.ajax({
            url: '/api/register',
            type: 'POST',
            data: data,
            //contentType: 'application/json',
            context: this,
            success: this.registerSuccess,
            error: this.registerError
        });
    }
};

RegisterPage.prototype.registerSuccess = function (data, status) {
    window.location = data.goto;
};

RegisterPage.prototype.registerError = function (jq, status, httpError) {
    if (status === 'error' && httpError === 'Unauthorized') {
        this.setRegisterError('Wrong username or password');
    } else {
        this.setRegisterError('There was a problem reaching the server. Please try again later.');
    }
};

RegisterPage.prototype.setRegisterError = function (error) {
    if (!error) {
        this.$msg.hide();
    } else {
        this.$msg.html(error);
        this.$msg.show();
    }
};

module.exports = RegisterPage;