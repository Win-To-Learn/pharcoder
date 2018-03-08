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
    playServers: {
        local: 'localhost:7610',
        east: 'http://pharcoder-dev.elasticbeanstalk.com:7610',
        west: 'http://pharcoder.us-west-1.elasticbeanstalk.com:7610'
    },
    ioServerOptions: {
        perMessageDeflate: false,
        transports: ['websocket']
    },
    initialBodies: [
        {type: 'Asteroid', number: 25, config: {
            position: {random: 'world'},
            velocity: {random: 'vector', lo: -8, hi: 8},
            angularVelocity: {random: 'float', lo: -12, hi: 12},
            vectorScale: {random: 'float', lo: 2, hi: 4},
            mass: 12
        }},
        {type: 'Hydra', number: 0, config: {
            position: {random: 'world', pad: 50}
        }},
        {type: 'Planetoid', number: 15, config: {
            position: {random: 'world', pad: 30},
            angularVelocity: {random: 'float', lo: -5, hi: 5},
            mass: 120
        }},
        {type: 'Alien', number: 6, config: {
            position: {random: 'world', pad: 30},
            genus: 'Warrior',
            vectorScale: 1,
            mass: 7
        }},
        {type: 'Alien', number: 9, config: {
            position: {random: 'world', pad: 30},
            genus: 'EcoTerrorist',
            vectorScale: 1,
            mass: 7
        }},
        {type: 'Alien', number: 4, config: {
            position: {random: 'world', pad: 30},
            genus: 'BlockBuster',
            vectorScale: 1,
            mass: 9
        }},
        {type: 'Crystal', number: 10, config: {
            position: {random: 'world', pad: 30},
            genus: 'hidden'
        }},
        // vvvvv Testing vvvvv
        {type: 'Crystal', number: 40, config: {
            position: {random: 'world', pad: 30}
        }}
        // {type: 'Critter', number: 180, config: {
        //     position: {random: 'world', pad: 30}
        // }}
    ]
};
