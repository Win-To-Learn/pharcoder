/**
 * Screenshots.js
 *
 * Created by jay on 10/8/17
 */

const path = require('path');
const fs = require('fs');

const destDir = path.join(__dirname, '../../../ssuploads');

module.exports = {
    init: function () {
        const self = this;
        const fileRE = /screenshot\d+\.(jpg|png)/;
        // Read directory
        this.screenshots = fs.readdirSync(destDir).filter(fileRE.test.bind(fileRE));
        this.nextSSNum = this.screenshots.length + 1;

        // Setup handlers
        this.app.post('/ss', function (req, res) {
            const name = `screenshot${self.nextSSNum++}.jpg`;
            const dest = fs.createWriteStream(path.join(destDir, name));
            self.screenshots.push(name);
            req.pipe(dest);
            req.on('end', function () {
                res.status(200).end();
                // Broadcast to all users
            });
        });

        this.app.get('/ss/num', function (req, res) {
            res.status(200).send({count: self.screenshots.length});
        });

        this.app.get('/ss/:n', function (req, res) {
            if (self.screenshots.length) {
                let n = req.params.n % self.screenshots.length;
                n = n < 0 ? n + self.screenshots.length : n;
                const name = self.screenshots[n];
                res.sendFile(name, {root: destDir});
            } else {
                res.status(404).end();
            }
        });
    }
};