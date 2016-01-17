/**
 * FSM.js
 *
 * Very basic implementation of a finite state machine
 *
 */
'use strict';

var EventEmitter = require('events').EventEmitter;

var FSM = function (machine, initial) {
    EventEmitter.call(this);
    this.initial = initial;
    this.state = initial;
    this.machine = machine;
    this.stack = [];
    this.timeout = null;
    this.immediate = null
};

FSM.prototype = Object.create(EventEmitter.prototype);
FSM.prototype.constructor = FSM;

FSM.prototype.transition = function (path, save) {
    var oldstate = this.state;
    var newstate = this.machine[oldstate] && this.machine[oldstate][path];
    if (newstate) {
        if (save) {
            this.stack.push(oldstate);
        }
        this.goto(oldstate, newstate);
    }
};

FSM.prototype.restore = function () {
    if (this.stack.length) {
        var state = this.stack.pop();
        this.goto(this.state, state);
    }
};

FSM.prototype.goto = function (oldstate, newstate) {
    if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
    }
    if (this.immediate) {
        clearInterval(this.immediate);
        this.immediate = null;
    }
    this.emit(newstate, oldstate, newstate);
    this.state = newstate;
    if (this.machine[newstate]) {
        var self = this;
        var auto = this.machine[newstate].auto;
        var timeout = this.machine[newstate].timeout;
        if (auto) {
            if (timeout) {
                this.timeout = setTimeout(function () {
                    self.goto(newstate, auto);
                }, timeout);
            } else {
                this.immediate = setImmediate(function () {
                    self.goto(newstate, auto);
                });
            }
        }
    }
};

FSM.prototype.reset = function () {
    this.emit('reset');
    this.state = this.initial;
    this.stack.length = 0;
};

FSM.prototype.marshal = function () {
    return this.state;
};

FSM.prototype.checkState = function (state) {
    return (state === this.state);
};

module.exports = FSM;