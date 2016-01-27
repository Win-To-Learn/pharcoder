/**
 * config.js
 *
 * common config
 */

module.exports = {
    version: '0.1',
    //serverUri: 'http://pharcoder-single-1.elasticbeanstalk.com:8080',
    //serverUri: 'http://localhost:8081',
    //serverAddress: '1.2.3.4',
    //worldBounds: [-400, -400, 400, 400],
    worldBounds: [-300, -300, 300, 300],
    physicsScale: 20,
    renderLatency: 100,
    frameRate: (1 / 60),
    timeSyncFreq: 10,
    shipMass: 100           // Stopgap pending physics refactor
};