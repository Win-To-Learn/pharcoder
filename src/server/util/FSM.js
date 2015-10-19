/**
 * FSM.js
 *
 * Very basic implementation of a finite state machine
 *
 */
'use strict';

var EventEmitter = require('events').EventEmitter;

var FSM = function (initial, machine) {
    EventEmitter.call(this);
    this.initial = initial;
    this.state = initial;
    this.machine = machine;
    this.interval = null;
};

FSM.prototype = Object.create(EventEmitter.prototype);
FSM.prototype.constructor = FSM;

FSM.prototype.transition = function (path) {
    var oldstate = this.state;
    var newstate = this.machine[oldstate][path];
    if (newstate) {
        var next = this.machine[newstate].next;
        this.emit(newstate, path, oldstate, newstate);
        this.state = newstate;
        while (next) {
            this.emit(next, 'next', this.state, next);
            this.state = next;
            next = this.machine[next].next;
        }
    } else {
        emit('badPath', path, oldstate, newstate);
    }
};

FSM.prototype.reset = function () {
    this.emit('reset');
    this.state = this.initial;
};

FSM.prototype.marshal = function () {
    return this.state;
};

FSM.prototype.checkState = function (state) {
    return (state === this.state);
};

module.exports = FSM;