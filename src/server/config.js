/**
 * config.js
 *
 * server side config
 */

module.exports = {
    initialBodies: [
        {type: 'Asteroid', number: 25, config: {
            position: {random: 'world'},
            velocity: {random: 'vector', lo: -15, hi: 15},
            angularVelocity: {random: 'float', lo: -5, hi: 5},
            vectorScale: {random: 'float', lo: 0.6, hi: 1.4},
            mass: 10
        }},
        //{type: 'Crystal', number: 10, config: {
        //    position: {random: 'world'},
        //    velocity: {random: 'vector', lo: -4, hi: 4, normal: true},
        //    vectorScale: {random: 'float', lo: 0.4, hi: 0.8},
        //    mass: 5
        //}}
        {type: 'Hydra', number: 1, config: {
            position: {random: 'world', pad: 50}
        }},
        {type: 'Planetoid', number: 6, config: {
            position: {random: 'world', pad: 30},
            angularVelocity: {random: 'float', lo: -2, hi: 2},
            vectorScale: 2.5,
            mass: 100
        }},
        //{type: 'StarTarget', number: 10, config: {
        //    position: {random: 'world', pad: 30},
        //    vectorScale: 0.5,
        //    stars: [[0, 0], [1,1], [-1,1], [1,-1]]
        //}}
        // FIXME: Trees just for testing
        //{type: 'Tree', number: 10, config: {
        //    position: {random: 'world', pad: 30},
        //    vectorScale: 1,
        //    mass: 5
        //}}
    ]
};