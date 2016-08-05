/**
 * config.js
 *
 * server side config
 */

module.exports = {
    syncInterval: 50,
    netInterval: 50,
    physicsInterval: 20,
    physicsSubsteps: 10,
    mongoUri: 'mongodb://8f430f6d1c664352bc7a03fd25a4eeeb:a0bc1ff6774045ceae6b8b37a9292910@ds061200.mongolab.com:61200/starcoder',
    sessionSecret: 'thisisabadsecret',
    interpreterStatusThresholds: {
        warn: 1,
        critical: 5,
        kill: 10
    },
    ioServerOptions: {
        perMessageDeflate: false
    },
    initialBodies: [
        {type: 'Asteroid', number: 55, config: {
            position: {random: 'world'},
            velocity: {random: 'vector', lo: -5, hi: 5},
            angularVelocity: {random: 'float', lo: -3, hi: 3},
            vectorScale: {random: 'float', lo: 2, hi: 4},
            mass: 25
        }},
        {type: 'Hydra', number: 1, config: {
            position: {random: 'world', pad: 50}
        }},
        {type: 'Planetoid', number: 20, config: {
            position: {random: 'world', pad: 30},
            angularVelocity: {random: 'float', lo: -2, hi: 2},
            mass: 120
        }},
        {type: 'Alien', number: 4, config: {
            position: {random: 'world', pad: 30},
            genus: 'Warrior',
            vectorScale: 1,
            mass: 10
        }},
        {type: 'Alien', number: 8, config: {
            position: {random: 'world', pad: 30},
            genus: 'EcoTerrorist',
            vectorScale: 1,
            mass: 10
        }},
        // vvvvv Testing vvvvv
        {type: 'Crystal', number: 40, config: {
            position: {random: 'world', pad: 30}
        }}
    ]
};