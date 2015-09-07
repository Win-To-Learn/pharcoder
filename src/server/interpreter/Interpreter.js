/**
 * Interpreter.js
 *
 * JS-Interpreter wrapper for implementing API
 */
'use strict';

var JSInterpreter = require('./js-interp/interpreter.js');

var API = require('./API.js');
//var Marshal = require('./Marshal.js');

var Interpreter = function (code, player) {
    var randstem = ((Math.random() + 1)*1e31).toString(36);
    this.loopflag = 'loopflag_' + randstem;
    this.mainloop = 'mainloop_' + randstem;
    this.curevent = 'curevent_' + randstem;
    this.player = player;
    this.eventQueue = [];
    this.timeoutCache = [];
    this.intervalCache = [];
    code += 'while (' + this.loopflag + ') {\n' +
            this.mainloop + '();\n' +
            'if (' + this.curevent + ') {\n' +
            this.curevent + '.call(null);\n'+
            '}\n' +
            '}';
    //console.log(code);
    JSInterpreter.call(this, code, this.initStarcoder.bind(this));
};

Interpreter.prototype = Object.create(JSInterpreter.prototype);
Interpreter.prototype.constructor = Interpreter;

Interpreter.prototype.initStarcoder = function (interpreter, scope) {
    this.topScope = scope;
    for (var key in API) {
        var elem = API[key];
        // TODO: Handle constants, complex objects, etc.
        if (typeof elem !== 'function') {
            continue;
        }
        interpreter.setProperty(scope, key, this.wrapNativeJS(elem));
    }
    interpreter.setProperty(scope, this.loopflag, interpreter.createPrimitive(false), false, true);
    interpreter.setProperty(scope, this.mainloop , this.wrapNativeJS(this.mainLoopShift), false, true);
};

Interpreter.prototype.cleanup = function () {
    for (var i = 0, l = this.timeoutCache.length; i < l; i++) {
        clearTimeout(this.timeoutCache[i]);
    }
    for (i = 0, l = this.intervalCache.length; i < l; i++) {
        clearTimeout(this.intervalCache[i]);
    }
};

Interpreter.prototype.wrapNativeJS = function (func) {
    var self = this;
    var wrapper = function () {
        var args = [self.player];
        for (var i = 0, l = arguments.length; i < l; i++) {
            args.push(interpToNative[arguments[i].type](arguments[i]));
        }
        var r = func.apply(self, args);
        if (r) {
            return nativeToInterp[typeof r](self, r);
        }
        //if (func.async) {
        //    self.setProperty(self.topScope, self.loopflag, self.createPrimitive(true));
        //}
    };
    return this.createNativeFunction(wrapper);
};

Interpreter.prototype.toggleEventLoop = function (state) {
    this.setProperty(this.topScope, this.loopflag, this.createPrimitive(state));
};

Interpreter.prototype.mainLoopShift = function () {
    var event = this.eventQueue.shift();
    if (event) {
        this.setProperty(this.topScope, this.curevent, event);
    } else {
        this.setProperty(this.topScope, this.curevent, this.UNDEFINED);
    }
};

var interpToNative = {};

interpToNative.undefined = function (u) {
    return undefined;
};

interpToNative.string = function (s) {
    return s.toString();
};

interpToNative.number = function (s) {
    return s.toNumber();
};

interpToNative.boolean = function (s) {
    return s.toBoolean();
};

interpToNative.function = function (f) {
    return f;
};

interpToNative.object = function (o) {
    if (typeof o.length !== 'undefined') {
        var native = [];
    } else {
        native = {};
    }
    o.__native = native;
    for (var k in o.properties) {
        var p = o.properties[k];
        if (p.isPrimitive) {
            native[k] = p.data;
        } else if (p.__native) {
            native[k] = p.__native;
        } else {
            native[k] = interpToNative.object(p);
        }
    }
    delete o.__native;
    return native;
};

var nativeToInterp = {};

nativeToInterp.string = function (interpreter, s) {
    return interpreter.createPrimitive(s);
};
nativeToInterp.number = nativeToInterp.string;
nativeToInterp.boolean = nativeToInterp.string;

nativeToInterp.function = function (interpreter, f) {
    return f;
};

nativeToInterp.object = function (interpreter, o) {
    if (o.getUpdatePacket) {
        o = o.getUpdatePacket(true);
    }
    if (o instanceof Array) {
        var pseudo = interpreter.createObject(interpreter.ARRAY);
        o.__pseudo = pseudo;
        for (var i = 0, l = o.length; i < l; i++) {
            if (o[i].__pseudo) {
                interpreter.setProperty(pseudo, i, o[i]);
            } else {
                interpreter.setProperty(pseudo, i, nativeToInterp[typeof o[i]](interpreter, o[i]));
            }
        }
    } else {
        pseudo = interpreter.createObject(interpreter.OBJECT);
        o.__pseudo = pseudo;
        for (i in o) {
            if (i === '__pseudo') {
                continue;
            }
            if (o[i].__pseudo) {
                interpreter.setProperty(pseudo, i, o[i]);
            } else {
                interpreter.setProperty(pseudo, i, nativeToInterp[typeof o[i]](interpreter, o[i]));
            }
        }
    }
    delete o.__pseudo;
    return pseudo;
};

module.exports = Interpreter;