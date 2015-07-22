/**
 * RESTEndpoint.js
 */
' use strict';

var bodyParser = require('body-parser');

var RESTEndpoint = function () {};

RESTEndpoint.prototype.initRESTEndpoint = function () {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: false}));
    // Enable cross origin requests
    this.app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:8000");     // FIXME use config
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    this.app.post('/rest/login', function (req, res) {
        req.session.token = 'pickle';
        console.log('Rest', req.sessionID, req.session.foo);
        res.status(204).end();
    });
};

module.exports = RESTEndpoint;
