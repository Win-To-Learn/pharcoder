/**
 * Interpreter.js
 *
 * JS-Interpreter wrapper for implementing API
 */
'use strict';

var acorn = require('acorn');

var JSInterpreter = require('./js-interp/interpreter.js');

var API = require('./API.js');
//var Marshal = require('./Marshal.js');

var Interpreter = function (player) {
    var randstem = ((Math.random() + 1)*1e31).toString(36);
    this.loopflag = 'loopflag_' + randstem;
    this.mainloop = 'mainloop_' + randstem;
    this.curevent = 'curevent_' + randstem;
    this.curargs = 'curargs_' + randstem;
    this.player = player;
    this.idle = true;
    this.eventQueue = [];
    this.eventQueueArgs = [];
    this.timeoutCache = [];
    this.intervalCache = [];
    var code = [
        'while (' + this.loopflag + ') {',
        '    ' + this.mainloop + '();',
        '    if (' + this.curevent + ') {',
        '        ' + this.curevent + '.apply(null, ' + this.curargs + ');',
        '    }',
        '}'
    ];
    code = code.join('\n');
    JSInterpreter.call(this, code, this.initStarcoder.bind(this));
};

Interpreter.prototype = Object.create(JSInterpreter.prototype);
Interpreter.prototype.constructor = Interpreter;

Interpreter.prototype.initStarcoder = function (interpreter, scope) {
    this.topScope = scope;
    this.truePrimitive = interpreter.createPrimitive(true);
    this.falsePrimitive = interpreter.createPrimitive(false);
    this.emptyList = interpreter.createObject(interpreter.ARRAY);       // Just for empty arg lists
    for (var key in API) {
        var elem = API[key];
        // TODO: Handle constants, complex objects, etc.
        if (typeof elem !== 'function') {
            continue;
        }
        interpreter.setProperty(scope, key, this.wrapNativeJS(elem));
    }
    interpreter.setProperty(scope, this.loopflag, this.truePrimitive, false, true);
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
    let self = this;
    let meta = func.meta || [];
    let wrapper = function () {
        let args = [self.player];
        // for (let i = 0, l = arguments.length; i < l; i++) {
        //     args.push(interpToNative[arguments[i].type](arguments[i]));
        // }
        if (arguments.length > meta.length) {
            throw {name: 'Too many arguments'};
        }
        for (let i = 0; i < meta.length; i++) {
            let arg = arguments[i];
            let argcheck = meta[i];
            if (typeof arg === 'undefined' && !argcheck.optional) {
                throw {name: 'Missing argument'};
            }
            // Could perhaps to more / better type checking here
            //if ((argcheck.type === 'array' && (arg.type !== 'object' || !arg.properties.length)) ||
            //    (argcheck.type !== arg.type)) {
            //    throw {name: 'Wrong argument type'}
            //} else {
                args.push(interpToNative[arg.type](arg));
            //}
        }
        let r = func.apply(self, args);
        if (typeof r !== 'undefined') {
            return nativeToInterp[typeof r](self, r);
        }
        //if (func.async) {
        //    self.setProperty(self.topScope, self.loopflag, self.createPrimitive(true));
        //}
    };
    return this.createNativeFunction(wrapper);
};

Interpreter.prototype.wrapCodeString = function (code) {
    var ast = acorn.parse(code);
    ast.type = 'BlockStatement';
    return this.createFunction({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: ast
    });
};

Interpreter.prototype.addEvent = function (code, args) {
    if (typeof code === 'string') {
        code = this.wrapCodeString(code);
    }
    if (args) {
        args = nativeToInterp.object(args);
    } else {
        args = this.emptyList;
    }
    this.eventQueue.push(code);
    this.eventQueueArgs.push(args);
};

Interpreter.prototype.toggleEventLoop = function (state) {
    if (state) {
        this.setProperty(this.topScope, this.loopflag, this.truePrimitive);
    } else {
        this.setProperty(this.topScope, this.loopflag, this.falsePrimitive);
    }
};

Interpreter.prototype.mainLoopShift = function () {
    var event = this.eventQueue.shift();
    var args = this.eventQueueArgs.shift();
    if (event) {
        this.setProperty(this.topScope, this.curevent, event);
        this.setProperty(this.topScope, this.curargs, args);
        this.idle = false;
    } else {
        this.setProperty(this.topScope, this.curevent, this.UNDEFINED);
        this.idle = true;
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
    if (o.__target) {
        native.__body = o.__target;
    }
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
    if (o.getProxy) {
        o = o.getProxy();
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
            if (i === '__target') {
                pseudo.__target = o[i];
                continue;
            } else if (i === '__pseudo') {
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