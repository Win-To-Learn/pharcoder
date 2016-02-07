/**
 * CollisionHandlers.js
 */
'use strict';

var p2 = require('p2');

module.exports = {
    init: function () {
        var self = this;
        this.world.on('beginContact', function (e) {
            var A = e.bodyA;
            var B = e.bodyB;
            if (A.dead || B.dead) {
                return;
            }
            var senseA = e.shapeA.sensor;
            var senseB = e.shapeB.sensor;
            var equations = e.contactEquations;
            // Alt collision system
            if (A.beginContact && !senseA) {
                A.beginContact(B, equations, e.shapeA, e.shapeB);
            }
            if (B.beginContact && !senseB) {
                B.beginContact(A, equations, e.shapeA, e.shapeB);
            }
            if (A.beginSense && senseA) {
                A.beginSense(B, equations, e.shapeA, e.shapeB);
            }
            if (B.beginSense && senseB) {
                B.beginSense(A, equations, e.shapeA, e.shapeB);
            }
        });
        this.world.on('endContact', function (e) {
            var A = e.bodyA;
            var senseA = e.shapeA.sensor;
            var B = e.bodyB;
            var senseB = e.shapeB.sensor;
            // Alt collision system
            if (A.endContact && !senseA) {
                A.endContact(B, e);
            }
            if (B.endContact && !senseB) {
                B.endContact(A, e);
            }
            if (A.endSense && senseA) {
                A.endSense(B, e);
            }
            if (B.endSense && senseB) {
                B.endSense(A, e);
            }
        });
    }
};
