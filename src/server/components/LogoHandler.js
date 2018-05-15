/**
 * LogoHandler.js
 *
 * Created by jay on 5/12/18
 */

const fs = require('fs');

module.exports = {
    init: function () {
        this.app.get('/api/logo/:uid', this.getLogo.bind(this));
    },

    getLogo (req, res) {
        this.getLogoByPlayerId(req.params.uid).then(function (img) {
            res.set('Content-Type', 'image/png');
            res.set('Access-Control-Allow-Origin', '*');
            res.send(img);
        }, function (err) {
            res.sendStatus(404);
        });
    }
};