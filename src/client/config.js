/**
 * config.js
 *
 * client side config
 */

module.exports = {
    ioClientOptions: {
        //forceNew: true
        reconnection: false,
        transports: ['websocket']
    },
    fonts: {
        hudCode: {font: '26px Arial', fill: '#00ffff', align: 'center'},
        leaderBoard: {font: '18px Arial', fill: '#0000ff'},
        leaderBoardTitle: {font: 'bold 20px Arial', align: 'center', fill: '#ff0000'}
    },
    links: [
        {text: 'STARCODER MISSIONS', url: 'http://bit.ly/starcodermissions', x: '25%', y: '-24',
        properties: {font: '20px Arial', fill: '#ffa500', align: 'center'}},
        {text: 'FEEDBACK', url: 'http://goo.gl/forms/kbEqsuMSFeN4aP0X2', x: '75%', y: '-24',
            properties: {font: '20px Arial', fill: '#ffa500', align: 'center'}}
    ],
    gridSpacing: 10,
    gridColor: '#fff380',
    gamerTags: {
        1: [
            'super',
            'awesome',
            'rainbow',
            'double',
            'triple',
            'vampire',
            'princess',
            'ice',
            'fire',
            'robot',
            'werewolf',
            'sparkle',
            'infinite',
            'cool',
            'yolo',
            'swaggy',
            'zombie',
            'samurai',
            'dancing',
            'power',
            'gold',
            'silver',
            'radioactive',
            'quantum',
            'brilliant',
            'mighty',
            'random'
        ],
        2: [
            'tiger',
            'ninja',
            'princess',
            'robot',
            'pony',
            'dancer',
            'rocker',
            'master',
            'hacker',
            'rainbow',
            'kitten',
            'puppy',
            'boss',
            'wizard',
            'hero',
            'dragon',
            'tribute',
            'genius',
            'blaster',
            'spider'
        ]
    }
};