"use strict";

module.exports = function (app) {

  var path = require('path');

  var sendFile = function(root, filename, res) {
    return res.sendFile(filename, {
      root: root
    }, function (err) {
      if (err) {
        console.log(err);
        res.status(err.status).end();
      }
      else {
        console.log('Sent:', root + filename);
      }
    });
  };

  app.get('/', function (req, res) {
    return sendFile(path.join(__dirname, '../'), 'index.html', res);
  });

  app.get('/css/:name', function (req, res) {
    return sendFile(path.join(__dirname, '../css/'), req.params.name, res);
  });

  app.get('/js/:name', function (req, res) {
    return sendFile(path.join(__dirname, '../js/'), req.params.name, res);
  });

  app.get('/lib/msg/js/:name', function (req, res) {
    return sendFile(path.join(__dirname, '../lib/msg/js/'), req.params.name, res);
  });

  app.get('/lib/:name', function (req, res) {
    return sendFile(path.join(__dirname, '../lib/'), req.params.name, res);
  });

  app.get('/assets/sounds/:name', function (req, res) {
    return sendFile(path.join(__dirname, '../assets/sounds/'), req.params.name, res);
  });

  app.get('/assets/:name', function (req, res) {
    return sendFile(path.join(__dirname, '../assets/'), req.params.name, res);
  });

};
