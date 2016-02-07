/**
 * StaticServer.js
 *
 * Basic http server for static files
 */
'use strict';

var path = require('path');
var express = require('express');

// TODO: automatically serve static assets without having to add routes here

var week = 7*24*60*60*1000;

module.exports = {
    init: function () {
        this.app.get('/', function (req, res) {
            if (!req.session || !req.session.ticketid) {
                res.redirect('/login.html');
            } else {
                res.redirect('/play.html');
            }
            //return sendFile(path.join(__dirname, '../../'), 'index.html', res);
            return res;
        });

        this.app.get('/loaderio-cba4b26d5a72654ff20e17307fdb2ba4.txt', function (req, res) {
            return sendFile(path.join(__dirname, '../../../'), 'loaderio-cba4b26d5a72654ff20e17307fdb2ba4.txt', res);
        });

        this.app.get('/blockly.html', function (req, res) {
            return sendFile(path.join(__dirname, '../../../'), 'blockly.html', res);
        });

        this.app.get('/src/BlocklyAPI.js', function (req, res) {
            return sendFile(path.join(__dirname, '../../../'), '/src/BlocklyAPI.js', res);
        });

        //this.app.get('/css/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../css/'), req.params.name, res);
        //});
        //
        //this.app.get('/css/images/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../css/images/'), req.params.name, res);
        //});
        //
        this.app.use('/css', express.static(path.join(__dirname, '../../../css/'), {maxAge: week}));
        //this.app.get('/js/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../js/'), req.params.name, res);
        //});
        //
        this.app.use('/js', express.static(path.join(__dirname, '../../../js/'), {maxAge: week}));
        //this.app.get('/lib/msg/json/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../lib/msg/json/'), req.params.name, res);
        //});
        //
        //this.app.get('/lib/msg/js/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../lib/msg/js/'), req.params.name, res);
        //});
        //
        //this.app.get('/lib/ace/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../lib/ace/'), req.params.name, res);
        //});
        //
        //this.app.get('/lib/ace/snippets/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../lib/ace/snippets/'), req.params.name, res);
        //});
        //
        //this.app.get('/lib/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../lib/'), req.params.name, res);
        //});
        this.app.use('/lib', express.static(path.join(__dirname, '../../../lib/'), {maxAge: week}));
        //this.app.get('/assets/sounds/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../assets/sounds/'), req.params.name, res);
        //});
        //
        //this.app.get('/assets/bitmapfonts/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../assets/bitmapfonts/'), req.params.name, res);
        //});
        //
        //this.app.get('/assets/images/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../assets/images/'), req.params.name, res);
        //});
        //
        //this.app.get('/assets/joystick/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../assets/joystick/'), req.params.name, res);
        //});
        //this.app.get('/assets/:name', function (req, res) {
        //    return sendFile(path.join(__dirname, '../../../assets/'), req.params.name, res);
        //});
        this.app.use('/assets', express.static(path.join(__dirname, '../../../assets/'), {maxAge: week}));
        // Experimental for new login interface
        this.app.get('/register.html', function (req, res) {
            return sendFile(path.join(__dirname, '../../../html/'), 'register.html', res);
        });
        this.app.get('/login.html', function (req, res) {
            return sendFile(path.join(__dirname, '../../../html/'), 'login.html', res);
        });
        this.app.get('/play.html', function (req, res) {
            if (!req.session || !req.session.ticketid) {
                res.redirect('/login.html');
                return res;
            }
            return sendFile(path.join(__dirname, '../../../html/'), 'play.html', res);
        });
    }
};

function sendFile (root, filename, res) {
    return res.sendFile(filename, {root: root},
        function (err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            } else {
                //console.log('Sent:', root + filename);
            }
        });
}
