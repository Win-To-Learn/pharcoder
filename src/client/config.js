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
        leaderBoard: {font: '18px Arial', fill: '#ff0000'},
        leaderBoardTitle: {font: 'bold 20px Arial', align: 'center', fill: '#ff0000'}
    },
    links: [
        {text: 'STARCODER MISSIONS', url: 'https://docs.google.com/presentation/d/1_-dH1ScTq2lz3vmLTBpw9YLW5HGa0lUil7Ry7ztFQNU/edit?usp=sharing', x: '25%', y: '-24',
            properties: {font: '20px Arial', fill: '#ffa500', align: 'center'}},
        {text: 'FEEDBACK', url: 'http://goo.gl/forms/kbEqsuMSFeN4aP0X2', x: '75%', y: '-24',
            properties: {font: '20px Arial', fill: '#ffa500', align: 'center'}},
        {text: '*please turn your speakers on*', url: '', x: '52%', y: '-24',
            properties: {font: '15px Arial', fill: '#ffffff', align: 'center'}},
        {text: '*PRESS V TO REPLAY VIDEOS*', url: '', x: '52%', y: '-44',
            properties: {font: '20px Arial', fill: '#ffffff', align: 'center'}},
        //{text: 'LEFT & RIGHT ARROW = TURN,  UP ARROW = THRUST,  SPACEBAR = FIRE,  T = TRACTOR BEAM, G = TOGGLE
        // GRID', url: '', x: '52%', y: '-64',
            //properties: {font: '18px Arial', fill: '#ffffff', align: 'center'}},
        {text: 'DRAW_SHAPE', url: 'http://aequoreagames.com/starcoder/coord_picker/', x: '90%', y: '-24',
            properties: {font: '20px Arial', fill: '#ffa500', align: 'RIGHT'}}


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