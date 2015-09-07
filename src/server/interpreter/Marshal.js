/**
 * Marshal.js
 *
 * Marshal native JS into and out of JS-interp
 */
'use strict';

var Marshal = {};

Marshal.wrap = function (interpreter, func, prepop) {
    var wrapper = function () {
        var aL = arguments.length;
        var pL = prepop.length;
        var skipped = 0;
        var args = [];
        for (var i = 0; i < pL || aL > 0; i++) {
            if (prepop[i]) {
                args.push(prepop[i]);
                skipped++;
            } else if (arguments[i-skipped]) {
                args.push(interpToNative[arguments[i-skipped].type](arguments[i-skipped]));
                aL--;
            } else {
                args.push(undefined);
            }
        }
        var r = func.apply(interpreter, args);
        if (r) {
            return nativeToInterp[typeof r](interpreter, r);
        }
    };
    return interpreter.createNativeFunction(wrapper);
};

var interpToNative = {};

interpToNative.string = function (s) {
    return s.toString();
};


interpToNative.number = function (s) {
    return s.toNumber();
};

interpToNative.boolean = function (s) {
    return s.toBoolean();
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

module.exports = Marshal;