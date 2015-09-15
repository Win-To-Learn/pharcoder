/**
 * frontend.js
 *
 * Interface to manage login / registration / management
 */
'use strict';

var config = require('./config.js');
var LoginPage = require('./LoginPage.js');
var RegisterPage = require('./RegisterPage.js');

$(function () {
    var page;
    $('.hidden').hide();
    if ($('#login-page').length) {
        page = new LoginPage(config);
    } else if ($('#register-page').length) {
        page = new RegisterPage(config);
    }
});